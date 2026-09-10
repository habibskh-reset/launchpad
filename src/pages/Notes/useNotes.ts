import { useCallback, useMemo } from "react";
import { createId } from "@/lib/id";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import type { NoteItem, NoteCreateInput, NoteUpdateInput } from "./notes.types";

const EMPTY_NOTES: NoteItem[] = [];

export function useNotes() {
  const notes = useWorkspaceStore((s) => s.workspace.notes ?? EMPTY_NOTES);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.pinned !== b.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes]);

  const addNote = useCallback(
    (input: NoteCreateInput): string => {
      const id = createId("note");
      const timestamp = new Date().toISOString();
      const newNote: NoteItem = {
        id,
        title: input.title.trim() || "Untitled Note",
        content: input.content.trim(),
        pinned: Boolean(input.pinned),
        color: input.color ?? "default",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      setWorkspace((prev) => ({
        ...prev,
        notes: [newNote, ...(prev.notes ?? [])],
      }));

      return id;
    },
    [setWorkspace],
  );

  const updateNote = useCallback(
    (id: string, patch: NoteUpdateInput) => {
      const timestamp = new Date().toISOString();
      setWorkspace((prev) => ({
        ...prev,
        notes: (prev.notes ?? []).map((n) =>
          n.id === id ? { ...n, ...patch, updatedAt: timestamp } : n,
        ),
      }));
    },
    [setWorkspace],
  );

  const togglePin = useCallback(
    (id: string) => {
      const timestamp = new Date().toISOString();
      setWorkspace((prev) => ({
        ...prev,
        notes: (prev.notes ?? []).map((n) =>
          n.id === id ? { ...n, pinned: !n.pinned, updatedAt: timestamp } : n,
        ),
      }));
    },
    [setWorkspace],
  );

  const removeNote = useCallback(
    (id: string) => {
      setWorkspace((prev) => ({
        ...prev,
        notes: (prev.notes ?? []).filter((n) => n.id !== id),
      }));
    },
    [setWorkspace],
  );

  return {
    notes: sortedNotes,
    addNote,
    updateNote,
    togglePin,
    removeNote,
  };
}