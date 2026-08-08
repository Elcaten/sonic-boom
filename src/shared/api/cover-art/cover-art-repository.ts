import { getCoverCacheKey } from "@/shared/lib/media";
import * as Crypto from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import { ImageSource } from "expo-image";

export type CoverArtSize = 32 | 48 | 256;
export type StoredCoverArtSize = 48 | 256;

type ManifestEntry = {
  fileName: string;
  size: StoredCoverArtSize;
  updatedAt: number;
};

type CoverArtManifest = {
  schemaVersion: 1;
  accountHash: string;
  entries: Record<string, ManifestEntry>;
  expectedKeys: string[];
  initialSyncAttempted: boolean;
  initialSyncComplete: boolean;
};

type GetCoverArtParams = {
  entityId: string;
  size: CoverArtSize;
  getUrl: () => Promise<string>;
  force?: boolean;
  signal?: AbortSignal;
};

const SCHEMA_VERSION = 1;
const DOWNLOAD_TIMEOUT_MS = 15_000;
const RETRY_DELAY_MS = 500;

export class CoverArtRepository {
  private readonly accountIdentity: string;
  private readonly inFlight = new Map<string, Promise<ImageSource>>();
  private manifest: CoverArtManifest | undefined;
  private manifestWriteQueue: Promise<void> = Promise.resolve();
  private directoriesPromise: Promise<{
    accountHash: string;
    accountDirectory: Directory;
    coversDirectory: Directory;
    manifestFile: File;
  }> | null = null;

  constructor({ serverAddress, username }: { serverAddress: string; username: string }) {
    this.accountIdentity = `${normalizeServerAddress(serverAddress)}\n${username.trim().toLowerCase()}`;
  }

  getStoredSize(size: CoverArtSize): StoredCoverArtSize {
    return size === 256 ? 256 : 48;
  }

  getKey(entityId: string, size: CoverArtSize): string {
    return getCoverCacheKey({ id: entityId, size: this.getStoredSize(size) });
  }

  async getCoverArt({ entityId, size, getUrl, force = false, signal }: GetCoverArtParams) {
    const storedSize = this.getStoredSize(size);
    const cacheKey = this.getKey(entityId, storedSize);

    if (!force) {
      const localSource = await this.getLocalSource(cacheKey, storedSize);
      if (localSource) return localSource;
    }

    const existingRequest = this.inFlight.get(cacheKey);
    if (existingRequest) return existingRequest;

    const request = this.downloadCoverArt({ cacheKey, storedSize, getUrl, signal }).finally(() => {
      this.inFlight.delete(cacheKey);
    });
    this.inFlight.set(cacheKey, request);
    return request;
  }

  async getInitialSyncState(): Promise<{ attempted: boolean; complete: boolean }> {
    const manifest = await this.getManifest();
    return {
      attempted: manifest.initialSyncAttempted,
      complete: manifest.initialSyncComplete,
    };
  }

  async isInitialSyncComplete(): Promise<boolean> {
    return (await this.getManifest()).initialSyncComplete;
  }

  async markInitialSyncAttempted(): Promise<void> {
    await this.updateManifest((manifest) => {
      manifest.initialSyncAttempted = true;
    });
  }

  async finishSync(expectedKeys: string[], complete: boolean): Promise<void> {
    await this.updateManifest((manifest) => {
      manifest.expectedKeys = [...new Set(expectedKeys)];
      manifest.initialSyncAttempted = true;
      manifest.initialSyncComplete = complete;
    });
  }

  async prune(expectedKeys: string[]): Promise<void> {
    const expected = new Set(expectedKeys);
    const { coversDirectory } = await this.getDirectories();

    await this.updateManifest((manifest) => {
      for (const [cacheKey, entry] of Object.entries(manifest.entries)) {
        if (expected.has(cacheKey)) continue;
        const file = new File(coversDirectory, entry.fileName);
        if (file.exists) file.delete();
        delete manifest.entries[cacheKey];
      }
    });

    const referencedFiles = new Set(Object.values((await this.getManifest()).entries).map((e) => e.fileName));
    for (const item of coversDirectory.list()) {
      if (item instanceof File && !referencedFiles.has(item.name)) item.delete();
    }
  }

  async clear(): Promise<void> {
    const { accountDirectory } = await this.getDirectories();
    if (accountDirectory.exists) accountDirectory.delete();
    this.manifest = undefined;
    this.directoriesPromise = null;
    this.inFlight.clear();
  }

  private async getLocalSource(
    cacheKey: string,
    size: StoredCoverArtSize,
  ): Promise<ImageSource | null> {
    const manifest = await this.getManifest();
    const { coversDirectory } = await this.getDirectories();
    const entry = manifest.entries[cacheKey];

    if (entry) {
      const file = new File(coversDirectory, entry.fileName);
      if (isValidFile(file)) return createImageSource(file, cacheKey);
    }

    const recovered = await this.recoverFile(cacheKey, size);
    if (!recovered) return null;
    return createImageSource(recovered, cacheKey);
  }

  private async recoverFile(cacheKey: string, size: StoredCoverArtSize): Promise<File | null> {
    const { coversDirectory } = await this.getDirectories();
    const prefix = `${await hash(cacheKey)}-`;
    const candidates = coversDirectory
      .list()
      .filter((item): item is File => item instanceof File && item.name.startsWith(prefix))
      .filter(isValidFile)
      .sort((a, b) => (b.lastModified ?? 0) - (a.lastModified ?? 0));
    const recovered = candidates[0];
    if (!recovered) return null;

    await this.updateManifest((manifest) => {
      manifest.entries[cacheKey] = {
        fileName: recovered.name,
        size,
        updatedAt: recovered.lastModified ?? Date.now(),
      };
    });
    return recovered;
  }

  private async downloadCoverArt({
    cacheKey,
    storedSize,
    getUrl,
    signal,
  }: {
    cacheKey: string;
    storedSize: StoredCoverArtSize;
    getUrl: () => Promise<string>;
    signal?: AbortSignal;
  }): Promise<ImageSource> {
    const url = await getUrl();
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await this.downloadOnce({ cacheKey, storedSize, url, signal });
      } catch (error) {
        lastError = error;
        if (signal?.aborted || attempt === 1) break;
        await delay(RETRY_DELAY_MS);
      }
    }
    throw lastError;
  }

  private async downloadOnce({
    cacheKey,
    storedSize,
    url,
    signal,
  }: {
    cacheKey: string;
    storedSize: StoredCoverArtSize;
    url: string;
    signal?: AbortSignal;
  }): Promise<ImageSource> {
    const { coversDirectory } = await this.getDirectories();
    const temporaryDirectory = new Directory(Paths.cache, "album-art-downloads");
    temporaryDirectory.create({ idempotent: true, intermediates: true });

    const keyHash = await hash(cacheKey);
    const generation = `${Date.now()}-${Crypto.randomUUID()}`;
    const temporaryFile = new File(temporaryDirectory, `${keyHash}-${generation}.tmp`);
    const destination = new File(coversDirectory, `${keyHash}-${generation}.img`);
    const timeoutController = createTimeoutController(signal, DOWNLOAD_TIMEOUT_MS);

    try {
      const downloaded = await File.downloadFileAsync(url, temporaryFile, {
        idempotent: true,
        signal: timeoutController.signal,
      });
      if (!isValidFile(downloaded)) throw new Error(`Downloaded empty artwork ${cacheKey}`);

      const oldEntry = (await this.getManifest()).entries[cacheKey];
      await downloaded.move(destination, { overwrite: true });
      const updatedAt = Date.now();
      await this.updateManifest((manifest) => {
        manifest.entries[cacheKey] = {
          fileName: destination.name,
          size: storedSize,
          updatedAt,
        };
      });

      if (oldEntry && oldEntry.fileName !== destination.name) {
        const oldFile = new File(coversDirectory, oldEntry.fileName);
        if (oldFile.exists) oldFile.delete();
      }
      return createImageSource(destination, cacheKey);
    } finally {
      timeoutController.dispose();
      const leftover = new File(temporaryFile.uri);
      if (leftover.exists) leftover.delete();
    }
  }

  private async getDirectories() {
    if (!this.directoriesPromise) {
      this.directoriesPromise = (async () => {
        const accountHash = await hash(this.accountIdentity);
        const accountDirectory = new Directory(
          Paths.document,
          "album-art",
          `v${SCHEMA_VERSION}`,
          accountHash,
        );
        const coversDirectory = new Directory(accountDirectory, "covers");
        coversDirectory.create({ idempotent: true, intermediates: true });
        return {
          accountHash,
          accountDirectory,
          coversDirectory,
          manifestFile: new File(accountDirectory, "manifest.json"),
        };
      })();
    }
    return this.directoriesPromise;
  }

  private async getManifest(): Promise<CoverArtManifest> {
    if (this.manifest) return this.manifest;
    const { accountHash, manifestFile } = await this.getDirectories();

    if (manifestFile.exists) {
      try {
        const parsed = JSON.parse(manifestFile.textSync()) as CoverArtManifest;
        if (parsed.schemaVersion === SCHEMA_VERSION && parsed.accountHash === accountHash) {
          this.manifest = parsed;
          return parsed;
        }
      } catch {
        // Deterministic file prefixes allow entries to be recovered lazily.
      }
    }

    this.manifest = createManifest(accountHash);
    return this.manifest;
  }

  private async updateManifest(update: (manifest: CoverArtManifest) => void): Promise<void> {
    const write = this.manifestWriteQueue.then(async () => {
      const manifest = await this.getManifest();
      update(manifest);
      const { accountDirectory, manifestFile } = await this.getDirectories();
      const temporaryManifest = new File(accountDirectory, `manifest-${Crypto.randomUUID()}.tmp`);
      temporaryManifest.create({ overwrite: true, intermediates: true });
      temporaryManifest.write(JSON.stringify(manifest));
      await temporaryManifest.move(manifestFile, { overwrite: true });
    });
    this.manifestWriteQueue = write.catch(() => undefined);
    return write;
  }
}

function createManifest(accountHash: string): CoverArtManifest {
  return {
    schemaVersion: 1,
    accountHash,
    entries: {},
    expectedKeys: [],
    initialSyncAttempted: false,
    initialSyncComplete: false,
  };
}

function normalizeServerAddress(serverAddress: string): string {
  return serverAddress.trim().replace(/\/+$/, "").toLowerCase();
}

function isValidFile(file: File): boolean {
  return file.exists && file.size > 0;
}

function createImageSource(file: File, stableKey: string): ImageSource {
  return {
    uri: file.uri,
    // iOS honors custom cache keys for local files, so include the generation to
    // prevent an atomic refresh from rendering the previous in-memory bitmap.
    cacheKey: `${stableKey}:${file.name}`,
  };
}

async function hash(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
}

function delay(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function createTimeoutController(parentSignal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("Artwork download timed out"), timeoutMs);
  const abortFromParent = () => controller.abort(parentSignal?.reason);
  if (parentSignal?.aborted) {
    abortFromParent();
  } else {
    parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  }

  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timeout);
      parentSignal?.removeEventListener("abort", abortFromParent);
    },
  };
}
