import { create } from "zustand";
import type { AppError } from "@/shared/api/errors";
import {
  cloneDefaultWorkspace,
  type Workspace,
  type TodoItem,
} from "@/types/workspace";
import type { NoteItem } from "@/pages/Notes/notes.types";
import type { StoredReport } from "@/pages/Reports/types";
import type { AppUser } from "@/types/auth";

export type AuthState = "initializing" | "authenticated" | "unauthenticated";

export interface SyncState {
  status: "idle" | "active" | "offline" | "error";
  message: string;
  error?: AppError;
}

export interface WorkspaceStoreState {
  user: AppUser | null;
  authState: AuthState;
  workspace: Workspace;
  sync: SyncState;
  setUser: (user: AppUser | null) => void;
  setWorkspace: (updaterOrWorkspace: Workspace | ((prev: Workspace) => Workspace)) => void;
  setSync: (sync: SyncState) => void;
  setTodos: (updater: (todos: TodoItem[]) => TodoItem[]) => void;
  setNotes: (updater: (notes: NoteItem[]) => NoteItem[]) => void;
  setReports: (updater: (reports: StoredReport[]) => StoredReport[]) => void;
}

export const useWorkspaceStore = create<WorkspaceStoreState>((set) => ({
  user: null,
  authState: "initializing",
  workspace: cloneDefaultWorkspace(),
  sync: {
    status: "idle",
    message: "Initializing...",
  },
  
  setUser: (user) => 
    set({ 
      user, 
      authState: user ? "authenticated" : "unauthenticated" 
    }),
  
  setWorkspace: (updaterOrWorkspace) =>
    set((state) => ({
      workspace:
        typeof updaterOrWorkspace === "function"
          ? updaterOrWorkspace(state.workspace)
          : updaterOrWorkspace,
    })),
    
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
export const selectTodos = (state: WorkspaceStoreState) => state.workspace.todos;