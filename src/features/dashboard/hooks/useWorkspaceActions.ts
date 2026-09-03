import { useCallback } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import type { Folder, LinkItem } from "@/types/workspace";

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useWorkspaceActions() {
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  const addLink = useCallback(
    (input: Omit<LinkItem, "id">) => {
      const link: LinkItem = { ...input, id: newId("link") };
      setWorkspace((prev) => ({ ...prev, links: [...prev.links, link] }));
    },
    [setWorkspace],
  );

  const updateLink = useCallback(
    (id: string, patch: Partial<LinkItem>) => {
      setWorkspace((prev) => ({
        ...prev,
        links: prev.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      }));
    },
    [setWorkspace],
  );

  const removeLink = useCallback(
    (id: string) => {
      setWorkspace((prev) => ({
        ...prev,
        links: prev.links.filter((l) => l.id !== id),
      }));
    },
    [setWorkspace],
  );

  const addFolder = useCallback(
    (input: Omit<Folder, "id">) => {
      const folder: Folder = { ...input, id: newId("col") };
      setWorkspace((prev) => ({ ...prev, columns: [...prev.columns, folder] }));
      return folder.id;
    },
    [setWorkspace],
  );

  const updateFolder = useCallback(
    (id: string, patch: Partial<Folder>) => {
      setWorkspace((prev) => ({
        ...prev,
        columns: prev.columns.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        ),
      }));
    },
    [setWorkspace],
  );

  const removeFolder = useCallback(
    (id: string) => {
      setWorkspace((prev) => ({
        ...prev,
        columns: prev.columns.filter((c) => c.id !== id),
        links: prev.links.filter((l) => l.columnId !== id),
      }));
    },
    [setWorkspace],
  );

  return {
    addLink,
    updateLink,
    removeLink,
    addFolder,
    updateFolder,
    removeFolder,
  };
}
