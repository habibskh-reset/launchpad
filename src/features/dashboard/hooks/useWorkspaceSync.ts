import { useEffect, useRef } from "react";
import { persistWorkspace, subscribeWorkspace } from "@/services/firebase/workspace";
import { formatAppError, toAppError } from "@/shared/api/errors";
import { useWorkspaceStore, selectWorkspace } from "@/stores/workspaceStore";
import type { Workspace } from "@/types/workspace";

const LOCAL_STORAGE_KEY = "launchpad_local_workspace";

function fingerprint(workspace: Workspace): string {
  return JSON.stringify(workspace);
}

export function useWorkspaceSync() {
  const user = useWorkspaceStore((s) => s.user);
  const workspace = useWorkspaceStore(selectWorkspace);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  const setSync = useWorkspaceStore((s) => s.setSync);
  const hasReceivedRemote = useRef(false);
  const lastFingerprint = useRef("");
  const skipNextPersist = useRef(false);

  // 1. Initial local cache hydration
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.columns)) {
          setWorkspace(parsed);
        }
      }
    } catch {
      // Ignore cache parse errors
    }
  }, [setWorkspace]);

  // 2. Cloud Subscription
  useEffect(() => {
    if (!user) {
      hasReceivedRemote.current = false;
      lastFingerprint.current = "";
      setSync({ status: "offline", message: "Signed Out" });
      return;
    }

    if (user.uid === "local") {
      hasReceivedRemote.current = true;
      setSync({ status: "active", message: "Saved Locally" });
      return;
    }

    setSync({ status: "offline", message: "Connecting..." });

    const unsubscribe = subscribeWorkspace(user.uid, {
      onReady: () => {
        hasReceivedRemote.current = true;
      },
      onData: (remote) => {
        hasReceivedRemote.current = true;
        const fp = fingerprint(remote);
        if (fp === lastFingerprint.current) {
          setSync({ status: "active", message: "Synced with Cloud" });
          return;
        }
        lastFingerprint.current = fp;
        skipNextPersist.current = true;
        setWorkspace(remote);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remote));
        setSync({ status: "active", message: "Synced with Cloud" });
      },
      onError: (err) => {
        hasReceivedRemote.current = true;
        const error = toAppError(err);
        setSync({
          status: "error",
          message: formatAppError("Sync Error", error),
          error,
        });
      },
    });

    return () => unsubscribe();
  }, [user, setWorkspace, setSync]);

  // 3. Debounced Persist (Saves to localStorage instantly, pushes to Firestore if logged in)
  useEffect(() => {
    // Always persist to local cache first
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      // Storage quota or private mode protection
    }

    if (!user) return;
    if (user.uid === "local") {
      setSync({ status: "active", message: "Saved Locally" });
      return;
    }

    if (!hasReceivedRemote.current) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }

    const fp = fingerprint(workspace);
    if (fp === lastFingerprint.current) return;

    const handle = setTimeout(() => {
      lastFingerprint.current = fp;
      setSync({ status: "offline", message: "Saving..." });

      persistWorkspace(user.uid, workspace)
        .then(() => {
          setSync({ status: "active", message: "Synced with Cloud" });
        })
        .catch((err) => {
          const error = toAppError(err);
          setSync({
            status: "error",
            message: formatAppError("Save Failed", error),
            error,
          });
        });
    }, 250);

    return () => clearTimeout(handle);
  }, [workspace, user, setSync]);
}