import { create } from "zustand";

type TaskStatus = "idle" | "loading" | "success" | "error";

export type MyDownloadTask =
  | {
      status: Extract<TaskStatus, "idle">;
      albumId?: never;
      progress?: never;
      errorMessage?: never;
    }
  | {
      albumId: string | undefined;
      status: Extract<TaskStatus, "loading">;
      progress: number;
      errorMessage?: never;
    }
  | {
      albumId: string | undefined;
      status: Extract<TaskStatus, "success">;
      progress: 100;
      errorMessage?: never;
    }
  | {
      albumId: string | undefined;
      status: Extract<TaskStatus, "error">;
      progress?: never;
      errorMessage: string;
    };

interface DownloadState {
  tasks: Map<string, MyDownloadTask>;
  setTaskLoading: (_: { albumId: string | undefined; fileId: string }) => void;
  setTaskProgress: (_: { albumId: string | undefined; fileId: string; progress: number }) => void;
  setTaskSuccess: (_: { albumId: string | undefined; fileId: string }) => void;
  setTaskError: (_: { albumId: string | undefined; fileId: string; error: string }) => void;
  clear: () => void;
}

export const useDownloadStore = create<DownloadState>((set) => ({
  tasks: new Map(),

  setTaskLoading: ({ albumId, fileId }) =>
    set((state) => ({
      tasks: new Map(state.tasks).set(fileId, { status: "loading", progress: 0.01, albumId }),
    })),

  setTaskProgress: ({ fileId, progress, albumId }) =>
    set((state) => ({
      tasks: new Map(state.tasks).set(fileId, { status: "loading", progress: progress, albumId }),
    })),

  setTaskSuccess: ({ albumId, fileId }) =>
    set((state) => ({
      tasks: new Map(state.tasks).set(fileId, { status: "success", progress: 100, albumId }),
    })),

  setTaskError: ({ albumId, fileId, error }) =>
    set((state) => ({
      tasks: new Map(state.tasks).set(fileId, { status: "error", errorMessage: error, albumId }),
    })),

  clear: () => {
    set({ tasks: new Map() });
  },
}));
