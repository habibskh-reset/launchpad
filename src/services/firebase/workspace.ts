import {
  doc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db as getDb } from "./app";
import { APP_ID } from "./config";
import type { Workspace } from "@/types/workspace";

function userDocRef(uid: string) {
  return doc(
    getDb(),
    "artifacts",
    APP_ID,
    "users",
    uid,
    "data",
    "state",
  );
}

function sanitizeForFirestore(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map(sanitizeForFirestore);
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      if (nestedValue === undefined) continue;
      result[key] = sanitizeForFirestore(nestedValue);
    }
    return result;
  }

  return undefined;
}

export function normalizeWorkspace(data: Partial<Workspace>): Workspace {
  return {
    settings: data.settings ?? {
      title: "Reset Launchpad",
    },
    columns: Array.isArray(data.columns) ? data.columns : [],
    links: Array.isArray(data.links) ? data.links : [],
    todos: Array.isArray(data.todos) ? data.todos : [],
    notes: Array.isArray(data.notes) ? data.notes : [],
    reports: Array.isArray(data.reports) ? data.reports : [],
  };
}

export interface WorkspaceSubscriptionCallbacks {
  onData: (workspace: Workspace) => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
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
      if (!data) return;
      callbacks.onData(normalizeWorkspace(data));
    },
    (error) => {
      callbacks.onError?.(error);
    },
  );
}

export async function persistWorkspace(
  uid: string,
  workspace: Workspace,
): Promise<void> {
  const cleanWorkspace = sanitizeForFirestore(workspace) as Workspace;
  await setDoc(userDocRef(uid), cleanWorkspace);
}