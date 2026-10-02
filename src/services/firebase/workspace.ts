import {
  doc,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db as getDb } from "./app";
import { APP_ID } from "./config";
import type { Workspace } from "@/types/workspace";

function docRef(uid: string, part: string) {
  return doc(getDb(), "artifacts", APP_ID, "users", uid, "data", part);
}

function sanitizeForFirestore(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined).map(sanitizeForFirestore);
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
    settings: data.settings ?? { title: "Reset Launchpad" },
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
  
  let currentWorkspace: Partial<Workspace> = {};
  let loaded = { state: false, links: false, todos: false, notes: false, reports: false };
  
  const checkReady = () => {
    if (loaded.state && loaded.links && loaded.todos && loaded.notes && loaded.reports) {
      callbacks.onReady?.();
      callbacks.onData(normalizeWorkspace(currentWorkspace));
    }
  };

  const partitions = ["state", "links", "todos", "notes", "reports"];
  
  const unsubs = partitions.map((part) => {
    return onSnapshot(
      docRef(uid, part),
      (snap) => {
        const data = snap.data() || {};
        if (part === "state") {
          currentWorkspace.settings = data.settings;
          currentWorkspace.columns = data.columns;
        } else {
          currentWorkspace[part as keyof Workspace] = data.items || [];
        }
        loaded[part as keyof typeof loaded] = true;
        checkReady();
      },
      (error) => {
        callbacks.onError?.(error);
      }
    );
  });

  return () => unsubs.forEach((u) => u());
}

export async function persistWorkspace(
  uid: string,
  workspace: Workspace,
): Promise<void> {
  const clean = sanitizeForFirestore(workspace) as Workspace;
  const batch = writeBatch(getDb());

  batch.set(docRef(uid, "state"), { settings: clean.settings, columns: clean.columns });
  batch.set(docRef(uid, "links"), { items: clean.links });
  batch.set(docRef(uid, "todos"), { items: clean.todos });
  batch.set(docRef(uid, "notes"), { items: clean.notes });
  batch.set(docRef(uid, "reports"), { items: clean.reports });

  await batch.commit();
}