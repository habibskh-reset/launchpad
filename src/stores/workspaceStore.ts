import { create } from "zustand";
import type { User } from "firebase/auth";
import type { AppError } from "@/shared/api/errors";
import {
  cloneDefaultWorkspace,
  type Workspace,
  type TodoItem,
} from "@/types/workspace";
import type { NoteItem } from "@/pages/Notes/notes.types";
import type { StoredReport } from "@/pages/Reports/types";

export interface SyncState {
  status: "idle" | "active" | "offline" | "error";
  message: string;
  error?: AppError;
}

interface WorkspaceStoreState {
  user: User | null;
  workspace: Workspace;
  sync: SyncState;
  setUser: (user: User | null) => void;
  setWorkspace: (workspace: Workspace) => void;
  setSync: (sync: SyncState) => void;
  setTodos: (updater: (todos: TodoItem[]) => TodoItem[]) => void;
  setNotes: (updater: (notes: NoteItem[]) => NoteItem[]) => void;
  setReports: (updater: (reports: StoredReport[]) => StoredReport[]) => void;
}

export const useWorkspaceStore = create<WorkspaceStoreState>((set) => ({
  user: null,
  workspace: cloneDefaultWorkspace(),
  sync: {
    status: "idle",
    message: "Initializing...",
  },
  setUser: (user) => set({ user }),
  setWorkspace: (workspace) => set({ workspace }),
  setSync: (sync) => set({ sync }),
  setTodos: (updater) =>
    set((state) => ({
      workspace: {
        ...state.workspace,
        todos: updater(state.workspace.todos || []),
      },
    })),
  setNotes: (updater) =>
    set((state) => ({
      workspace: {
        ...state.workspace,
        notes: updater(state.workspace.notes || []),
      },
    })),
  setReports: (updater) =>
    set((state) => ({
      workspace: {
        ...state.workspace,
        reports: updater(state.workspace.reports || []),
      },
    })),
}));

export const selectWorkspace = (state: WorkspaceStoreState) => state.workspace;