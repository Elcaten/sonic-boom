import { File } from "expo-file-system";
import { CoverArtRepository } from "../cover-art-repository";

const mockFileContents = new Map<string, string>();
const mockFileModified = new Map<string, number>();
const mockDirectories = new Set<string>();
let mockUuid = 0;

function mockNormalize(parts: unknown[]): string {
  return parts
    .map((part) =>
      typeof part === "string" ? part : (part as { uri: string }).uri,
    )
    .join("/")
    .replace(/(?<!:)\/{2,}/g, "/");
}

jest.mock("expo-crypto", () => ({
  CryptoDigestAlgorithm: { SHA256: "SHA256" },
  digestStringAsync: jest.fn(async (_algorithm: string, value: string) =>
    Array.from(value)
      .reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7)
      .toString(16)
      .padStart(8, "0"),
  ),
  randomUUID: jest.fn(() => `uuid-${++mockUuid}`),
}));

jest.mock("expo-file-system", () => {
  class MockDirectory {
    uri: string;

    constructor(...parts: unknown[]) {
      this.uri = mockNormalize(parts);
    }

    get exists() {
      return mockDirectories.has(this.uri);
    }

    create() {
      const segments = this.uri.split("/");
      for (let index = 3; index <= segments.length; index += 1) {
        mockDirectories.add(segments.slice(0, index).join("/"));
      }
    }

    delete() {
      for (const path of [...mockFileContents.keys()]) {
        if (path.startsWith(`${this.uri}/`)) mockFileContents.delete(path);
      }
      for (const path of [...mockDirectories]) {
        if (path === this.uri || path.startsWith(`${this.uri}/`)) mockDirectories.delete(path);
      }
    }

    list() {
      const prefix = `${this.uri}/`;
      return [...mockFileContents.keys()]
        .filter((path) => path.startsWith(prefix) && !path.slice(prefix.length).includes("/"))
        .map((path) => new MockFile(path));
    }
  }

  class MockFile {
    static downloadFileAsync = jest.fn(
      async (_url: string, destination: MockFile): Promise<MockFile> => {
        mockFileContents.set(destination.uri, "image-bytes");
        mockFileModified.set(destination.uri, Date.now());
        return new MockFile(destination.uri);
      },
    );

    uri: string;

    constructor(...parts: unknown[]) {
      this.uri = mockNormalize(parts);
    }

    get name() {
      return this.uri.split("/").at(-1)!;
    }

    get exists() {
      return mockFileContents.has(this.uri);
    }

    get size() {
      return mockFileContents.get(this.uri)?.length ?? 0;
    }

    get lastModified() {
      return mockFileModified.get(this.uri) ?? null;
    }

    create() {
      mockFileContents.set(this.uri, "");
      mockFileModified.set(this.uri, Date.now());
    }

    write(content: string) {
      mockFileContents.set(this.uri, content);
      mockFileModified.set(this.uri, Date.now());
    }

    textSync() {
      return mockFileContents.get(this.uri) ?? "";
    }

    delete() {
      mockFileContents.delete(this.uri);
      mockFileModified.delete(this.uri);
    }

    async move(destination: MockFile) {
      const content = mockFileContents.get(this.uri);
      if (content === undefined) throw new Error("Missing source");
      mockFileContents.set(destination.uri, content);
      mockFileModified.set(destination.uri, Date.now());
      this.delete();
      this.uri = destination.uri;
    }
  }

  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: {
      cache: new MockDirectory("file:///cache"),
      document: new MockDirectory("file:///document"),
    },
  };
});

describe("CoverArtRepository", () => {
  beforeEach(() => {
    mockFileContents.clear();
    mockFileModified.clear();
    mockDirectories.clear();
    mockUuid = 0;
    jest.mocked(File.downloadFileAsync).mockClear();
    jest.mocked(File.downloadFileAsync).mockImplementation(async (_url, destination) => {
      const file = destination as File;
      file.create({ overwrite: true, intermediates: true });
      file.write("image-bytes");
      return new File(file.uri);
    });
  });

  it("stores 32-point requests as the 48-point variant", () => {
    const repository = createRepository();
    expect(repository.getStoredSize(32)).toBe(48);
    expect(repository.getKey("album", 32)).toBe("cover-album-48");
  });

  it("downloads a missing image once and then returns the persistent file", async () => {
    const repository = createRepository();
    const getUrl = jest.fn(async () => "https://example.test/cover");

    const first = await repository.getCoverArt({ entityId: "album", size: 48, getUrl });
    const second = await repository.getCoverArt({ entityId: "album", size: 48, getUrl });

    expect(first.uri).toMatch(/^file:\/\/document\/album-art\/v1\//);
    expect(second).toEqual(first);
    expect(getUrl).toHaveBeenCalledTimes(1);
    expect(File.downloadFileAsync).toHaveBeenCalledTimes(1);
  });

  it("coalesces concurrent downloads for the same cover", async () => {
    const repository = createRepository();
    const getUrl = jest.fn(async () => "https://example.test/cover");

    const [first, second] = await Promise.all([
      repository.getCoverArt({ entityId: "album", size: 256, getUrl }),
      repository.getCoverArt({ entityId: "album", size: 256, getUrl }),
    ]);

    expect(second).toEqual(first);
    expect(File.downloadFileAsync).toHaveBeenCalledTimes(1);
  });

  it("keeps the previous generation when a forced refresh fails", async () => {
    const repository = createRepository();
    const getUrl = jest.fn(async () => "https://example.test/cover");
    const original = await repository.getCoverArt({ entityId: "album", size: 48, getUrl });
    jest.mocked(File.downloadFileAsync).mockRejectedValue(new Error("offline"));

    await expect(
      repository.getCoverArt({ entityId: "album", size: 48, getUrl, force: true }),
    ).rejects.toThrow("offline");

    const recovered = await repository.getCoverArt({ entityId: "album", size: 48, getUrl });
    expect(recovered).toEqual(original);
  });

  it("publishes a new URI and memory key after a successful refresh", async () => {
    const repository = createRepository();
    const getUrl = jest.fn(async () => "https://example.test/cover");
    const original = await repository.getCoverArt({ entityId: "album", size: 48, getUrl });

    const refreshed = await repository.getCoverArt({
      entityId: "album",
      size: 48,
      getUrl,
      force: true,
    });

    expect(refreshed.uri).not.toBe(original.uri);
    expect(refreshed.cacheKey).not.toBe(original.cacheKey);
    expect(new File(original.uri!).exists).toBe(false);
    expect(new File(refreshed.uri!).exists).toBe(true);
  });

  it("can mark an empty library as fully synchronized", async () => {
    const repository = createRepository();
    await repository.finishSync([], true);
    await expect(repository.isInitialSyncComplete()).resolves.toBe(true);
    await expect(repository.getInitialSyncState()).resolves.toEqual({
      attempted: true,
      complete: true,
    });
  });

  it("records a settled initial attempt separately from full completion", async () => {
    const repository = createRepository();
    await expect(repository.getInitialSyncState()).resolves.toEqual({
      attempted: false,
      complete: false,
    });

    await repository.markInitialSyncAttempted();

    await expect(repository.getInitialSyncState()).resolves.toEqual({
      attempted: true,
      complete: false,
    });
  });

  it("recovers a persistent generation when the manifest is corrupt", async () => {
    const repository = createRepository();
    const getUrl = jest.fn(async () => "https://example.test/cover");
    const original = await repository.getCoverArt({ entityId: "album", size: 48, getUrl });
    const manifestPath = [...mockFileContents.keys()].find((path) =>
      path.endsWith("manifest.json"),
    )!;
    mockFileContents.set(manifestPath, "not-json");

    const restoredRepository = createRepository();
    const restored = await restoredRepository.getCoverArt({ entityId: "album", size: 48, getUrl });

    expect(restored).toEqual(original);
    expect(File.downloadFileAsync).toHaveBeenCalledTimes(1);
  });
});

function createRepository() {
  return new CoverArtRepository({
    serverAddress: "https://music.example.test/",
    username: "listener",
  });
}
