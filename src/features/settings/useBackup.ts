import { useCallback } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import type { Workspace } from "@/types/workspace";

function isWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== "object") return false;
  const w = value as Partial<Workspace>;
  return Array.isArray(w.columns) && Array.isArray(w.links);
}

export function useBackup() {
  const workspace = useWorkspaceStore((s) => s.workspace);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  const exportBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `launchpad-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [workspace]);

  const importBackup = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(String(evt.target?.result ?? ""));
          if (isWorkspace(parsed)) {
            const next: Workspace = {
              settings: parsed.settings ?? { title: "Reset Launchpad" },
              columns: parsed.columns,
              links: parsed.links,
              todos: Array.isArray(parsed.todos) ? parsed.todos : [],
            };
            setWorkspace(next);
          }
        } catch (err) {
          console.error("Invalid JSON backup:", err);
        } finally {
          event.target.value = "";
        }
      };
      reader.readAsText(file);
    },
    [setWorkspace],
  );

  return { exportBackup, importBackup };
}
