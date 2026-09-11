import { useState, type ChangeEvent } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { CURRENT_BACKUP_VERSION, type BackupEnvelope, migrateBackupPayload } from "@/services/backup/schema";

export function useBackup() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const exportBackup = () => {
    try {
      setIsProcessing(true);
      setStatusMessage("Packaging workspace data...");

      const payload: BackupEnvelope = {
        app: "reset-launchpad",
        version: CURRENT_BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        workspace: {
          settings: workspace.settings ?? { title: "Reset Launchpad" },
          columns: Array.isArray(workspace.columns) ? workspace.columns : [],
          links: Array.isArray(workspace.links) ? workspace.links : [],
          todos: Array.isArray(workspace.todos) ? workspace.todos : [],
          notes: Array.isArray(workspace.notes) ? workspace.notes : [],
          reports: Array.isArray(workspace.reports) ? workspace.reports : [],
        },
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateTag = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `reset-launchpad-backup-v${CURRENT_BACKUP_VERSION}-${dateTag}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage("Backup downloaded successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error("Backup export failure:", err);
      alert("Failed to export workspace backup.");
      setStatusMessage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const importBackup = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage("Reading backup file...");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const rawContent = e.target?.result as string;
        if (!rawContent) {
          throw new Error("File appears to be empty.");
        }

        const parsed = JSON.parse(rawContent);
        const migratedWorkspace = migrateBackupPayload(parsed);

        const repCount = migratedWorkspace.reports?.length ?? 0;
        const taskCount = migratedWorkspace.todos.length;
        const noteCount = migratedWorkspace.notes?.length ?? 0;
        const linkCount = migratedWorkspace.links.length;
        const folderCount = migratedWorkspace.columns.length;

        const confirmation = window.confirm(
          `Restore Summary:\n` +
          `• ${folderCount} Resource Folders\n` +
          `• ${linkCount} Bookmarks\n` +
          `• ${taskCount} Tasks\n` +
          `• ${noteCount} Scratchpad Notes\n` +
          `• ${repCount} Gym Nation Reports\n\n` +
          `Do you want to overwrite your active workspace with this backup?`
        );

        if (!confirmation) {
          setIsProcessing(false);
          setStatusMessage(null);
          return;
        }

        setWorkspace(migratedWorkspace);
        setStatusMessage("Workspace restored successfully!");
        alert("Workspace backup restored successfully!");
      } catch (err) {
        console.error("Backup restoration failed:", err);
        alert(
          err instanceof Error
            ? `Failed to restore backup: ${err.message}`
            : "Failed to restore backup. Invalid JSON file."
        );
      } finally {
        setIsProcessing(false);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    };

    reader.onerror = () => {
      alert("Error reading backup file.");
      setIsProcessing(false);
      setStatusMessage(null);
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  return {
    exportBackup,
    importBackup,
    isProcessing,
    statusMessage,
  };
}