import type { DownloadTask } from "@kesha-antonov/react-native-background-downloader";
import type { DownloadTaskStore } from "../../store";
import type { DownloadIdentity, DownloadTaskState } from "../../types";
import { getDownloadKey } from "../../types";
import {
  deleteAllMediaDownloads,
  DownloadAdapter,
  recoverMediaDownloads,
  startMediaDownload,
} from "../download-coordinator";
import type { DownloadsRepository } from "../downloads-repository";

jest.mock("@kesha-antonov/react-native-background-downloader", () => ({
  completeHandler: jest.fn(),
  createDownloadTask: jest.fn(),
  getExistingDownloadTasks: jest.fn(),
}));

jest.mock("expo-file-system", () => {
  class MockDirectory {
    exists = false;
    uri = "file:///document/downloads";

    list() {
      return [];
    }

    delete() {}
  }

  class MockFile {
    exists = false;
    uri = "file:///document/downloads/track.audio";
    parentDirectory = new MockDirectory();
  }

  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: { document: new MockDirectory() },
  };
});

type MockTask = DownloadTask & {
  emitProgress: (downloaded: number, total: number) => void;
  emitDone: () => void;
};

function createTask(identity: DownloadIdentity, state: DownloadTask["state"] = "PENDING"): MockTask {
  let progressHandler: ((params: { bytesDownloaded: number; bytesTotal: number }) => void) | undefined;
  let doneHandler: (() => void) | undefined;
  const task = {
    id: getDownloadKey(identity),
    state,
    metadata: identity,
    errorCode: 0,
    bytesDownloaded: state === "PAUSED" ? 25 : 0,
    bytesTotal: state === "PAUSED" ? 100 : 0,
    begin: jest.fn().mockReturnThis(),
    progress: jest.fn((handler) => {
      progressHandler = handler;
      return task;
    }),
    done: jest.fn((handler) => {
      doneHandler = handler;
      return task;
    }),
    error: jest.fn().mockReturnThis(),
    setDownloadParams: jest.fn(),
    start: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    stop: jest.fn(),
    tryParseJson: jest.fn(),
    emitProgress: (downloaded: number, total: number) =>
      progressHandler?.({ bytesDownloaded: downloaded, bytesTotal: total }),
    emitDone: () => doneHandler?.(),
  } as unknown as MockTask;
  return task;
}

function createDependencies(existingTasks: MockTask[] = []) {
  const states = new Map<string, DownloadTaskState>();
  const store: DownloadTaskStore = {
    get: (identity) => states.get(getDownloadKey(identity)),
    start: jest.fn((identity, progress = 0) =>
      states.set(getDownloadKey(identity), { ...identity, status: "downloading", progress }),
    ),
    progress: jest.fn((identity, progress) =>
      states.set(getDownloadKey(identity), { ...identity, status: "downloading", progress }),
    ),
    fail: jest.fn((identity, errorMessage) =>
      states.set(getDownloadKey(identity), {
        ...identity,
        status: "failed",
        progress: 0,
        errorMessage,
      }),
    ),
    remove: jest.fn((identity) => states.delete(getDownloadKey(identity))),
    clear: jest.fn(() => states.clear()),
  };
  const createdTasks: MockTask[] = [];
  const adapter: DownloadAdapter = {
    create: jest.fn((options) => {
      const task = createTask(options.metadata);
      createdTasks.push(task);
      return task;
    }),
    existing: jest.fn(async () => existingTasks),
    complete: jest.fn(),
  };
  const repository = {
    has: jest.fn(() => false),
    prepareDestination: jest.fn(() => "/documents/downloads/track.mp3"),
    deleteAll: jest.fn(),
  } as unknown as DownloadsRepository;
  const onCatalogChanged = jest.fn();

  return { adapter, createdTasks, onCatalogChanged, repository, states, store };
}

describe("download coordinator", () => {
  const target = {
    albumArtistId: "artist",
    albumId: "album",
    trackId: "track",
    contentType: "audio/mpeg",
  };

  it("starts once, reports progress, and publishes completion", () => {
    const dependencies = createDependencies();

    expect(startMediaDownload({ target, remoteUrl: "https://media", dependencies })).toBe("started");
    expect(startMediaDownload({ target, remoteUrl: "https://media", dependencies })).toBe("skipped");

    const task = dependencies.createdTasks[0];
    task.emitProgress(50, 100);
    expect(dependencies.states.get(getDownloadKey(target))?.progress).toBe(0.5);

    task.emitDone();
    expect(dependencies.adapter.complete).toHaveBeenCalledWith(task.id);
    expect(dependencies.onCatalogChanged).toHaveBeenCalledTimes(1);
    expect(dependencies.states.has(getDownloadKey(target))).toBe(false);
  });

  it("recovers and resumes paused native tasks", async () => {
    const pausedTask = createTask(target, "PAUSED");
    const dependencies = createDependencies([pausedTask]);

    await recoverMediaDownloads(dependencies);

    expect(dependencies.store.start).toHaveBeenCalledWith(target, 0.25);
    expect(pausedTask.resume).toHaveBeenCalledTimes(1);
  });

  it("stops recovered tasks that use legacy artist metadata", async () => {
    const legacyTask = createTask(target);
    legacyTask.metadata = {
      artistId: "legacy-artist",
      albumId: target.albumId,
      trackId: target.trackId,
    };
    const dependencies = createDependencies([legacyTask]);

    await recoverMediaDownloads(dependencies);

    expect(legacyTask.stop).toHaveBeenCalledTimes(1);
    expect(dependencies.store.start).not.toHaveBeenCalled();
  });

  it("stops native work before deleting all files and state", async () => {
    const activeTask = createTask(target, "DOWNLOADING");
    const dependencies = createDependencies([activeTask]);

    await deleteAllMediaDownloads(dependencies);

    expect(activeTask.stop).toHaveBeenCalledTimes(1);
    expect(dependencies.repository.deleteAll).toHaveBeenCalledTimes(1);
    expect(dependencies.store.clear).toHaveBeenCalledTimes(1);
    expect(dependencies.onCatalogChanged).toHaveBeenCalledTimes(1);
  });
});
