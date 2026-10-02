import { useEffect, useRef } from "react";
import {
  persistWorkspace,
  subscribeWorkspace,
  normalizeWorkspace,
} from "@/services/firebase/workspace";
import { formatAppError, toAppError } from "@/shared/api/errors";
import { useWorkspaceStore, selectWorkspace } from "@/stores/workspaceStore";
import { cloneDefaultWorkspace, type Workspace } from "@/types/workspace";

const LOCAL_STORAGE_PREFIX = "launchpad_workspace";

function getStorageKey(userId: string): string {
  return `${LOCAL_STORAGE_PREFIX}:${userId}`;
}

function isWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== "object") return false;
  const workspace = value as Partial<Workspace>;
  return Array.isArray(workspace.columns) && Array.isArray(workspace.links);
}

// Cybr53 - highly performant local hashing
const cyrb53 = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

function fingerprint(w: Workspace): string {
  // Ultra-fast fingerprint evaluating subset IDs and state instead of full textual stringification
  const parts = [
    w.settings.title,
    w.columns.map(c => c.id).join(''),
    w.links.map(l => l.id + l.columnId + (l.pinned ? 'p' : '')).join(''),
    w.todos.map(t => t.id + t.done + t.dueDate).join(''),
    w.notes?.map(n => n.id + n.updatedAt).join('') || '',
    w.reports?.map(r => r.id + r.sortTimestamp).join('') || ''
  ];
  return cyrb53(parts.join('|')).toString();
}

function loadLocalWorkspace(userId: string): Workspace | null {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isWorkspace(parsed)) return null;
    return normalizeWorkspace(parsed);
  } catch {
    return null;
  }
}

function saveLocalWorkspace(userId: string, workspace: Workspace): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(workspace));
  } catch {
    // Ignore storage quota errors
  }
}

export function useWorkspaceSync() {
  const user = useWorkspaceStore((state) => state.user);
  const workspace = useWorkspaceStore(selectWorkspace);
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
  const setSync = useWorkspaceStore((state) => state.setSync);

  const activeUserId = useRef<string | null>(null);
  const lastRemoteFingerprint = useRef("");
  const applyingRemote = useRef(false);
  const remoteReady = useRef(false);

  useEffect(() => {
    if (!user) {
      activeUserId.current = null;
      lastRemoteFingerprint.current = "";
      applyingRemote.current = false;
      remoteReady.current = false;

      setWorkspace(cloneDefaultWorkspace());
      setSync({ status: "offline", message: "Signed Out" });
      return;
    }

    activeUserId.current = user.uid;
    lastRemoteFingerprint.current = "";
    applyingRemote.current = false;
    remoteReady.current = user.uid === "local";

    const cached = loadLocalWorkspace(user.uid);
    setWorkspace(cached ?? cloneDefaultWorkspace());

    if (user.uid === "local") {
      setSync({ status: "active", message: "Saved Locally" });
    } else {
      setSync({ status: "offline", message: "Connecting..." });
    }
  }, [user?.uid, setWorkspace, setSync]);

  useEffect(() => {
    if (!user || user.uid === "local") return;

    const userId = user.uid;

    return subscribeWorkspace(userId, {
      onReady: () => {
        if (activeUserId.current !== userId) return;
        remoteReady.current = true;
        setSync({ status: "active", message: "Synced with Cloud" });
      },
      onData: (remoteWorkspace) => {
        if (activeUserId.current !== userId) return;

        const normalized = normalizeWorkspace(remoteWorkspace);
        const remoteFingerprint = fingerprint(normalized);

        lastRemoteFingerprint.current = remoteFingerprint;
        applyingRemote.current = true;

        setWorkspace(normalized);
        saveLocalWorkspace(userId, normalized);

        setSync({ status: "active", message: "Synced with Cloud" });
      },
      onError: (error) => {
        if (activeUserId.current !== userId) return;
        remoteReady.current = false;
        const appError = toAppError(error);
        setSync({
          status: "error",
          message: formatAppError("Sync Error", appError),
          error: appError,
        });
      },
    });
  }, [user?.uid, setWorkspace, setSync]);

  useEffect(() => {
    if (!user) return;
    const userId = user.uid;
    if (activeUserId.current !== userId) return;

    saveLocalWorkspace(userId, workspace);

    if (userId === "local") {
      setSync({ status: "active", message: "Saved Locally" });
      return;
    }

    if (!remoteReady.current) return;

    const currentFingerprint = fingerprint(workspace);
    if (applyingRemote.current) {
      applyingRemote.current = false;
      return;
    }

    if (currentFingerprint === lastRemoteFingerprint.current) return;

    const timeoutId = window.setTimeout(() => {
      if (activeUserId.current !== userId) return;

      setSync({ status: "offline", message: "Saving..." });

      persistWorkspace(userId, workspace)
        .then(() => {
          if (activeUserId.current !== userId) return;
          lastRemoteFingerprint.current = currentFingerprint;
          setSync({ status: "active", message: "Synced with Cloud" });
        })
        .catch((error) => {
          if (activeUserId.current !== userId) return;
          const appError = toAppError(error);
          setSync({
            status: "error",
            message: formatAppError("Save Failed", appError),
            error: appError,
          });
        });
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [workspace, user?.uid, setSync]);
}