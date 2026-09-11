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

export function isBackupEnvelope(data: unknown): data is BackupEnvelope {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Record<string, unknown>;
  return (
    typeof candidate.version === "number" &&
    typeof candidate.workspace === "object" &&
    candidate.workspace !== null
  );
}

/**
 * Normalizes and upgrades any backup payload (v1 legacy raw workspace, v2 envelope, or v3).
 * Guarantees every single slice (columns, links, todos, notes, reports) is present and array-typed.
 */
export function migrateBackupPayload(raw: unknown): Workspace {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid file content: Expected a valid JSON object.");
  }

  let workspaceData: Partial<Workspace>;

  if (isBackupEnvelope(raw)) {
    workspaceData = raw.workspace;
  } else if ("workspace" in raw && typeof (raw as { workspace: unknown }).workspace === "object") {
    workspaceData = (raw as { workspace: Partial<Workspace> }).workspace;
  } else {
    // Legacy v1 raw workspace export format
    workspaceData = raw as Partial<Workspace>;
  }

  return normalizeWorkspace(workspaceData);
}