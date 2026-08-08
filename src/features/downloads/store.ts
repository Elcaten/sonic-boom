import { create } from "zustand";
import {
  DownloadIdentity,
  DownloadTaskMap,
  DownloadTaskState,
  getDownloadKey,
} from "./types";

type DownloadStore = {
  tasks: DownloadTaskMap;
  startTask: (identity: DownloadIdentity, progress?: number) => void;
  updateTaskProgress: (identity: DownloadIdentity, progress: number) => void;
  failTask: (identity: DownloadIdentity, errorMessage: string) => void;
  removeTask: (identity: DownloadIdentity) => void;
  clearTasks: () => void;
};

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(1, progress));
}

function setTask(tasks: DownloadTaskMap, task: DownloadTaskState): DownloadTaskMap {
  return new Map(tasks).set(getDownloadKey(task), task);
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  tasks: new Map(),
  startTask: (identity, progress = 0) =>
    set((state) => ({
      tasks: setTask(state.tasks, {
        ...identity,
        status: "downloading",
        progress: clampProgress(progress),
      }),
    })),
  updateTaskProgress: (identity, progress) =>
    set((state) => ({
      tasks: setTask(state.tasks, {
        ...identity,
        status: "downloading",
        progress: clampProgress(progress),
      }),
    })),
  failTask: (identity, errorMessage) =>
    set((state) => ({
      tasks: setTask(state.tasks, {
        ...identity,
        status: "failed",
        progress: state.tasks.get(getDownloadKey(identity))?.progress ?? 0,
        errorMessage,
      }),
    })),
  removeTask: (identity) =>
    set((state) => {
      const tasks = new Map(state.tasks);
      tasks.delete(getDownloadKey(identity));
      return { tasks };
    }),
  clearTasks: () => set({ tasks: new Map() }),
}));

export const downloadTaskStore = {
  get: (identity: DownloadIdentity) => useDownloadStore.getState().tasks.get(getDownloadKey(identity)),
  start: (identity: DownloadIdentity, progress?: number) =>
    useDownloadStore.getState().startTask(identity, progress),
  progress: (identity: DownloadIdentity, progress: number) =>
    useDownloadStore.getState().updateTaskProgress(identity, progress),
  fail: (identity: DownloadIdentity, errorMessage: string) =>
    useDownloadStore.getState().failTask(identity, errorMessage),
  remove: (identity: DownloadIdentity) => useDownloadStore.getState().removeTask(identity),
  clear: () => useDownloadStore.getState().clearTasks(),
};

export type DownloadTaskStore = typeof downloadTaskStore;
