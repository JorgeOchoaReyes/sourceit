import { type Source } from "~/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Store {
  localSource: Source | null;
  setLocalSource: (source: Source) => void;
  clearLocalSource: () => void;
}

export const useStore = create(
  persist<Store>(
    (set, _get) => ({
      localSource: null,
      setLocalSource: (source) => set({ localSource: source }),      
      clearLocalSource: () => set({ localSource: null }),
    }),
    {
      name: "sourceit-storage", 
      storage: createJSONStorage(() => localStorage), 
    },
  ),
);