import { create, type StateCreator } from "zustand";
import {
  type Workspace,
  type LinkItem,
  type Folder,
  type TodoItem,
  cloneDefaultWorkspace,
} from "@/types/workspace";
import type { AppUser, SyncState } from "@/types/auth";

export type OrgRole = "owner" | "admin" | "member" | "viewer";
export type PlanId = "free" | "pro";

export interface Organization {
  id: string;
  name: string;
  plan: PlanId;
}

const DEFAULT_ORG: Organization = {
  id: "org_personal",
  name: "Personal",
  plan: "pro",
};

function sessionFromUser(user: AppUser | null): {
  org: Organization;
  role: OrgRole;
} {
  if (!user) {
    return { org: DEFAULT_ORG, role: "viewer" };
  }
  const name = user.displayName?.trim();
  return {
    org: {
      id: `org_${user.uid}`,
      name: name ? `${name}'s workspace` : "Personal",
      plan: "pro",
    },
    role: "owner",
  };
}

interface WorkspaceStore {
  workspace: Workspace;
  user: AppUser | null;
  org: Organization;
  role: OrgRole;
  sync: SyncState;
  setWorkspace: (
    workspace: Workspace | ((prev: Workspace) => Workspace),
  ) => void;
  setUser: (user: AppUser | null) => void;
  setSync: (sync: SyncState) => void;
  resetWorkspace: () => void;
}

const creator: StateCreator<WorkspaceStore> = (set) => ({
  workspace: cloneDefaultWorkspace(),
  user: null,
  org: DEFAULT_ORG,
  role: "viewer",
  sync: { status: "offline", message: "Connecting..." },

  setWorkspace: (workspace) =>
    set((state) => {
      const next =
        typeof workspace === "function"
          ? (workspace as (prev: Workspace) => Workspace)(state.workspace)
          : workspace;

      if (state.workspace === next) {
        return state;
      }

      if (
        JSON.stringify(state.workspace) ===
        JSON.stringify(next)
      ) {
        return state;
      }

      return { workspace: next };
    }),

  setUser: (user) =>
    set({
      user,
      ...sessionFromUser(user),
    }),

  setSync: (sync) =>
    set((state) => {
      if (
        state.sync.status === sync.status &&
        state.sync.message === sync.message &&
        state.sync.error === sync.error
      ) {
        return state;
      }

      return { sync };
    }),

  resetWorkspace: () =>
    set({
      workspace: cloneDefaultWorkspace(),
    }),
});

export const useWorkspaceStore =
  create<WorkspaceStore>(creator);

export const selectWorkspace =
  (s: WorkspaceStore) => s.workspace;

export const selectUser =
  (s: WorkspaceStore) => s.user;

export const selectOrg =
  (s: WorkspaceStore) => s.org;

export const selectRole =
  (s: WorkspaceStore) => s.role;

export const selectSync =
  (s: WorkspaceStore) => s.sync;

export function selectLinksForColumn(
  columnId: string,
) {
  return (s: WorkspaceStore): LinkItem[] =>
    s.workspace.links.filter(
      (link) => link.columnId === columnId,
    );
}

export function selectFolder(
  id: string,
) {
  return (
    s: WorkspaceStore,
  ): Folder | undefined =>
    s.workspace.columns.find(
      (column) => column.id === id,
    );
}

export function selectTodos(
  s: WorkspaceStore,
): TodoItem[] {
  return s.workspace.todos;
}

export function selectWorkspaceTitle(
  s: WorkspaceStore,
): string {
  return (
    s.workspace.settings?.title ??
    "Reset Launchpad"
  );
}