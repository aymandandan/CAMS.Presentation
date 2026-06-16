import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationTreeState {
  expandedIds: string[];
  toggleExpanded: (id: string) => void;
  setExpanded: (id: string, expanded: boolean) => void;
  clear: () => void;
}

export const useLocationTreeStore = create<LocationTreeState>()(
  persist(
    (set) => ({
      expandedIds: [],
      toggleExpanded: (id) =>
        set((state) => ({
          expandedIds: state.expandedIds.includes(id)
            ? state.expandedIds.filter((eid) => eid !== id)
            : [...state.expandedIds, id],
        })),
      setExpanded: (id, expanded) =>
        set((state) => ({
          expandedIds: expanded
            ? state.expandedIds.includes(id)
              ? state.expandedIds
              : [...state.expandedIds, id]
            : state.expandedIds.filter((eid) => eid !== id),
        })),
      clear: () => set({ expandedIds: [] }),
    }),
    {
      name: "location-tree-expanded",
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name);
          if (!item) return null;
          try {
            return JSON.parse(item);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => sessionStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => sessionStorage.removeItem(name),
      }, // persists across page refreshes / navigations
    },
  ),
);
