import {
  completeHandler,
  createDownloadTask,
  getExistingDownloadTasks,
  type DownloadTask,
} from "@kesha-antonov/react-native-background-downloader";
import { DownloadIdentity, DownloadTarget, getDownloadKey } from "../types";
import { downloadTaskStore, DownloadTaskStore } from "../store";
import { DownloadsRepository, downloadsRepository } from "./downloads-repository";

type CreateTaskOptions = {
  id: string;
  url: string;
  destination: string;
  metadata: DownloadIdentity;
};

export type DownloadAdapter = {
  create: (options: CreateTaskOptions) => DownloadTask;
  existing: () => Promise<DownloadTask[]>;
  complete: (taskId: string) => void;
};

export const nativeDownloadAdapter: DownloadAdapter = {
  create: createDownloadTask,
  existing: getExistingDownloadTasks,
  complete: completeHandler,
};

const ignoredTaskIds = new Set<string>();

export type DownloadCoordinatorDependencies = {
  adapter?: DownloadAdapter;
  repository?: DownloadsRepository;
  store?: DownloadTaskStore;
  onCatalogChanged: () => void | Promise<void>;
  onError?: (message: string, error?: unknown) => void;
};

function isDownloadIdentity(value: Record<string, unknown>): value is DownloadIdentity {
  return (
    typeof value.artistId === "string" &&
    typeof value.albumId === "string" &&
    typeof value.trackId === "string"
  );
}

function taskIdentity(task: DownloadTask): DownloadIdentity | undefined {
  return isDownloadIdentity(task.metadata) ? task.metadata : undefined;
}

function progressFraction(bytesDownloaded: number, bytesTotal: number): number {
  return bytesTotal > 0 ? bytesDownloaded / bytesTotal : 0;
}

function attachTask(
  task: DownloadTask,
  identity: DownloadIdentity,
  dependencies: Required<Pick<DownloadCoordinatorDependencies, "adapter" | "store">> &
    Pick<DownloadCoordinatorDependencies, "onCatalogChanged" | "onError">,
): void {
  const { adapter, store, onCatalogChanged, onError } = dependencies;
  task
    .begin(() => {
      if (!ignoredTaskIds.has(task.id)) store.start(identity);
    })
    .progress(({ bytesDownloaded, bytesTotal }) => {
      if (!ignoredTaskIds.has(task.id)) {
        store.progress(identity, progressFraction(bytesDownloaded, bytesTotal));
      }
    })
    .done(() => {
      if (ignoredTaskIds.has(task.id)) {
        adapter.complete(task.id);
        return;
      }
      store.remove(identity);
      adapter.complete(task.id);
      void onCatalogChanged();
    })
    .error(({ error }) => {
      if (ignoredTaskIds.has(task.id)) return;
      store.fail(identity, error);
      onError?.(`Download failed for ${identity.trackId}`, error);
    });
}

function resolveDependencies(dependencies: DownloadCoordinatorDependencies) {
  return {
    ...dependencies,
    adapter: dependencies.adapter ?? nativeDownloadAdapter,
    repository: dependencies.repository ?? downloadsRepository,
    store: dependencies.store ?? downloadTaskStore,
  };
}

export function startMediaDownload({
  target,
  remoteUrl,
  dependencies,
}: {
  target: DownloadTarget;
  remoteUrl: string;
  dependencies: DownloadCoordinatorDependencies;
}): "started" | "skipped" {
  const resolved = resolveDependencies(dependencies);
  if (resolved.repository.has(target) || resolved.store.get(target)?.status === "downloading") {
    return "skipped";
  }

  resolved.store.start(target);
  try {
    const task = resolved.adapter.create({
      id: getDownloadKey(target),
      url: remoteUrl,
      destination: resolved.repository.prepareDestination(target),
      metadata: {
        artistId: target.artistId,
        albumId: target.albumId,
        trackId: target.trackId,
      },
    });
    ignoredTaskIds.delete(task.id);
    attachTask(task, target, resolved);
    task.start();
    return "started";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    resolved.store.fail(target, message);
    resolved.onError?.(`Could not start download for ${target.trackId}`, error);
    return "skipped";
  }
}

export async function recoverMediaDownloads(
  dependencies: DownloadCoordinatorDependencies,
): Promise<void> {
  const resolved = resolveDependencies(dependencies);
  const tasks = await resolved.adapter.existing();
  let catalogChanged = false;

  for (const task of tasks) {
    ignoredTaskIds.delete(task.id);
    const identity = taskIdentity(task);
    if (!identity) {
      resolved.onError?.(`Discarding download task with invalid metadata: ${task.id}`);
      await task.stop();
      continue;
    }

    if (task.state === "DONE") {
      resolved.store.remove(identity);
      resolved.adapter.complete(task.id);
      catalogChanged = true;
      continue;
    }

    if (task.state === "FAILED" || task.state === "STOPPED") {
      resolved.store.fail(identity, "Download did not complete");
      continue;
    }

    resolved.store.start(identity, progressFraction(task.bytesDownloaded, task.bytesTotal));
    attachTask(task, identity, resolved);
    if (task.state === "PAUSED") await task.resume();
  }

  if (catalogChanged) await resolved.onCatalogChanged();
}

export async function deleteAllMediaDownloads(
  dependencies: DownloadCoordinatorDependencies,
): Promise<void> {
  const resolved = resolveDependencies(dependencies);
  const tasks = await resolved.adapter.existing();
  tasks.forEach((task) => ignoredTaskIds.add(task.id));
  await Promise.allSettled(tasks.map((task) => task.stop()));
  resolved.repository.deleteAll();
  resolved.store.clear();
  await resolved.onCatalogChanged();
}
