import { useCallback } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import type { Workspace } from "@/types/workspace";

const BACKUP_VERSION = 1;

interface WorkspaceBackup {
  version: number;
  exportedAt: string;
  data: Workspace;
}

function isWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== "object") return false;
  const ws = value as Partial<Workspace>;
  return Array.isArray(ws.columns) && Array.isArray(ws.links);
}

function normalizeWorkspace(value: Workspace): Workspace {
  return {
    settings: value.settings ?? { title: "Reset Launchpad" },
    columns: value.columns,
    links: value.links,
    todos: Array.isArray(value.todos) ? value.todos : [],
    notes: Array.isArray(value.notes) ? value.notes : [],
  };
}

function isVersionedBackup(value: unknown): value is WorkspaceBackup {
  if (!value || typeof value !== "object") return false;
  const backup = value as Partial<WorkspaceBackup>;
  return (
    typeof backup.version === "number" &&
    typeof backup.exportedAt === "string" &&
    isWorkspace(backup.data)
  );
}

function parseBackup(value: unknown): Workspace | null {
  if (isVersionedBackup(value)) {
    if (value.version > BACKUP_VERSION) return null;
    return normalizeWorkspace(value.data);
  }
  if (isWorkspace(value)) {
    return normalizeWorkspace(value);
  }
  return null;
}

export function useBackup() {
  const workspace = useWorkspaceStore((s) => s.workspace);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  const exportBackup = useCallback(() => {
    const backup: WorkspaceBackup = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: workspace,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `launchpad-backup-${new Date().toISOString().slice(0, 10)}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  }, [workspace]);

  const importBackup = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const rawText = String(loadEvent.target?.result ?? "");
          const parsed: unknown = JSON.parse(rawText);
          const importedWorkspace = parseBackup(parsed);

          if (!importedWorkspace) {
            throw new Error("Invalid backup format.");
          }

          setWorkspace(importedWorkspace);
        } catch (error) {
          console.error("Backup import failed:", error);
        } finally {
          event.target.value = "";
        }
      };

      reader.onerror = () => {
        console.error("Backup file could not be read.");
        event.target.value = "";
      };

      reader.readAsText(file);
    },
    [setWorkspace],
  );

  return { exportBackup, importBackup };
}