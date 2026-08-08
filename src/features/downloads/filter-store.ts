import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type DownloadedFilterStore = {
  filter: "all" | "downloaded";
  hasHydrated: boolean;
  setFilter: (filter: "all" | "downloaded") => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useDownloadedFilterStore = create<DownloadedFilterStore>()(
  persist(
    (set) => ({
      filter: "all",
      hasHydrated: false,
      setFilter: (filter) => set({ filter }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "downloaded-filter",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ filter: state.filter }),
      onRehydrateStorage: (state) => () => state.setHasHydrated(true),
    },
  ),
);
