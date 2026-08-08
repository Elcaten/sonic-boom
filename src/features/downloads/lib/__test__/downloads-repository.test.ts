import { File } from "expo-file-system";
import { DownloadsRepository, mediaExtension } from "../downloads-repository";

const mockFiles = new Set<string>();
const mockDirectories = new Set<string>();

function mockNormalize(parts: unknown[]): string {
  return parts
    .map((part) => (typeof part === "string" ? part : (part as { uri: string }).uri))
    .join("/")
    .replace(/(?<!:)\/{2,}/g, "/");
}

function mockCreateDirectories(uri: string): void {
  const parts = uri.split("/");
  for (let index = 3; index <= parts.length; index += 1) {
    mockDirectories.add(parts.slice(0, index).join("/"));
  }
}

jest.mock("expo-file-system", () => {
  class MockDirectory {
    uri: string;

    constructor(...parts: unknown[]) {
      this.uri = mockNormalize(parts);
    }

    get name() {
      return this.uri.split("/").at(-1)!;
    }

    get exists() {
      return mockDirectories.has(this.uri);
    }

    create() {
      mockCreateDirectories(this.uri);
    }

    delete() {
      for (const path of [...mockFiles]) {
        if (path.startsWith(`${this.uri}/`)) mockFiles.delete(path);
      }
      for (const path of [...mockDirectories]) {
        if (path === this.uri || path.startsWith(`${this.uri}/`)) mockDirectories.delete(path);
      }
    }

    list() {
      const prefix = `${this.uri}/`;
      const directories = [...mockDirectories]
        .filter((path) => path.startsWith(prefix) && !path.slice(prefix.length).includes("/"))
        .map((path) => new MockDirectory(path));
      const files = [...mockFiles]
        .filter((path) => path.startsWith(prefix) && !path.slice(prefix.length).includes("/"))
        .map((path) => new MockFile(path));
      return [...directories, ...files];
    }
  }

  class MockFile {
    uri: string;

    constructor(...parts: unknown[]) {
      this.uri = mockNormalize(parts);
    }

    get name() {
      return this.uri.split("/").at(-1)!;
    }

    get exists() {
      return mockFiles.has(this.uri);
    }

    get parentDirectory() {
      return new MockDirectory(this.uri.slice(0, this.uri.lastIndexOf("/")));
    }

    create() {
      mockCreateDirectories(this.parentDirectory.uri);
      mockFiles.add(this.uri);
    }
  }

  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: { document: new MockDirectory("file:///document") },
  };
});

describe("DownloadsRepository", () => {
  beforeEach(() => {
    mockFiles.clear();
    mockDirectories.clear();
  });

  it("creates encoded destinations and scans them back into identities", () => {
    const repository = new DownloadsRepository();
    const target = {
      artistId: "artist/a",
      albumId: "album b",
      trackId: "track.c",
      contentType: "audio/mpeg; charset=binary",
    };
    repository.prepareDestination(target);
    repository.file(target).create();

    expect(repository.list()).toEqual([
      { ...target, contentType: undefined, fileUri: repository.file(target).uri },
    ].map(({ contentType: _, ...track }) => track));
  });

  it("deletes the complete catalog", () => {
    const repository = new DownloadsRepository();
    const target = { artistId: "artist", albumId: "album", trackId: "track" };
    repository.prepareDestination(target);
    new File(repository.file(target).uri).create();

    repository.deleteAll();

    expect(repository.list()).toEqual([]);
  });

  it("ignores background downloader temporary files", () => {
    const repository = new DownloadsRepository();
    const target = { artistId: "artist", albumId: "album", trackId: "track" };
    repository.prepareDestination(target);
    new File(`${repository.file(target).uri}.tmp`).create();

    expect(repository.list()).toEqual([]);
  });

  it("uses stable common audio extensions", () => {
    expect(mediaExtension("audio/flac")).toBe("flac");
    expect(mediaExtension("audio/mpeg; charset=binary")).toBe("mp3");
    expect(mediaExtension(undefined)).toBe("audio");
  });
});
