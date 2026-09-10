import { type ChangeEvent } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { normalizeWorkspace } from "@/services/firebase/workspace";
import type { Workspace } from "@/types/workspace";

export function useBackup() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);

  const exportBackup = () => {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      workspace: {
        settings: workspace.settings,
        columns: workspace.columns,
        links: workspace.links,
        todos: workspace.todos || [],
        notes: workspace.notes || [],
        reports: workspace.reports || [],
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reset-launchpad-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importBackup = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const parsed = JSON.parse(raw);

        const dataToImport = (parsed.workspace || parsed) as Partial<Workspace>;

        if (!dataToImport || typeof dataToImport !== "object") {
          throw new Error("Invalid backup format");
        }

        const normalized = normalizeWorkspace(dataToImport);
        setWorkspace(normalized);
        alert("Workspace backup restored successfully!");
      } catch (err) {
        console.error("Failed to restore backup:", err);
        alert("Failed to restore backup. Please ensure the file is valid JSON.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return { exportBackup, importBackup };
}