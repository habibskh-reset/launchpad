import { doc, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore";
import { db as getDb } from "./app";
import { APP_ID } from "./config";
import type { Workspace } from "@/types/workspace";

function userDocRef(uid: string) {
  return doc(getDb(), "artifacts", APP_ID, "users", uid, "data", "state");
}

/**
 * Removes any undefined properties so Firestore setDoc() never throws
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export interface WorkspaceSubscriptionCallbacks {
  onData: (workspace: Workspace) => void;
  onReady?: () => void;
  onError?: (err: Error) => void;
}

export function subscribeWorkspace(
  uid: string,
  callbacks: WorkspaceSubscriptionCallbacks,
): Unsubscribe {
  return onSnapshot(
    userDocRef(uid),
    (snapshot) => {
      callbacks.onReady?.();
      if (!snapshot.exists()) return;
      const data = snapshot.data() as Partial<Workspace> | undefined;
      if (!data || !Array.isArray(data.columns) || data.columns.length === 0) {
        return;
      }
      callbacks.onData({
        settings: data.settings ?? { title: "Reset Launchpad" },
        columns: data.columns,
        links: Array.isArray(data.links) ? data.links : [],
        todos: Array.isArray(data.todos) ? data.todos : [],
      });
    },
    (err) => callbacks.onError?.(err),
  );
}

export async function persistWorkspace(
  uid: string,
  workspace: Workspace,
): Promise<void> {
  const cleanData = sanitizeForFirestore(workspace);
  await setDoc(userDocRef(uid), cleanData);
}