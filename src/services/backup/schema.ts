import { z } from "zod";
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

// Ensure the schema explicitly defends against malicious formatting
const backupSchema = z.object({
  app: z.string().optional(),
  version: z.number().optional(),
  exportedAt: z.string().optional(),
  deviceInfo: z.string().optional(),
  workspace: z.object({
    settings: z.any().optional(),
    columns: z.array(z.any()).optional(),
    links: z.array(z.any()).optional(),
    todos: z.array(z.any()).optional(),
    notes: z.array(z.any()).optional(),
    reports: z.array(z.any()).optional(),
  }).optional(),
  data: z.any().optional(),
  state: z.any().optional(),
});

export function migrateBackupPayload(raw: unknown): Workspace {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid file content: Expected a JSON object.");
  }

  const parsed = backupSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid backup file structure.");
  }

  const obj = parsed.data;
  const candidate = obj.workspace || obj.data || obj.state || obj;

  if (!candidate) {
    throw new Error("No workspace data found.");
  }

  return normalizeWorkspace({
    settings: candidate.settings ?? { title: "Reset Launchpad" },
    columns: Array.isArray(candidate.columns) ? candidate.columns : [],
    links: Array.isArray(candidate.links) ? candidate.links : [],
    todos: Array.isArray(candidate.todos) ? candidate.todos : [],
    notes: Array.isArray(candidate.notes) ? candidate.notes : [],
    reports: Array.isArray(candidate.reports) ? candidate.reports : [],
  });
}