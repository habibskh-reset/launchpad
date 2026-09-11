import type { Workspace } from "@/types/workspace";
import { normalizeWorkspace } from "@/services/firebase/workspace";

export const CURRENT_BACKUP_VERSION = 3;

export interface BackupEnvelope {
  app: string;
  version: number;
  exportedAt: string;
  deviceInfo?: string;
  workspace: Workspace;
}

export function migrateBackupPayload(raw: unknown): Workspace {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid file content: Expected a JSON object.");
  }

  const obj = raw as Record<string, any>;

  // Check wrapper candidates: envelope (workspace), state, data, or raw root
  const candidate = obj.workspace || obj.data || obj.state || obj;

  return normalizeWorkspace({
    settings: candidate.settings ?? { title: "Reset Launchpad" },
    columns: Array.isArray(candidate.columns) ? candidate.columns : [],
    links: Array.isArray(candidate.links) ? candidate.links : [],
    todos: Array.isArray(candidate.todos) ? candidate.todos : [],
    notes: Array.isArray(candidate.notes) ? candidate.notes : [],
    reports: Array.isArray(candidate.reports) ? candidate.reports : [],
  });
}