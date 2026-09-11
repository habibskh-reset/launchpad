import { useState, useRef, type ChangeEvent } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { CURRENT_BACKUP_VERSION, type BackupEnvelope, migrateBackupPayload } from "@/services/backup/schema";
import { persistWorkspace } from "@/services/firebase/workspace";

const LOCAL_STORAGE_PREFIX = "launchpad_workspace";

export function useBackup() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const restoreWorkspace = useWorkspaceStore((state) => state.restoreWorkspace);
  const user = useWorkspaceStore((state) => state.user);

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const exportBackup = () => {
    try {
      setIsProcessing(true);
      setStatusMessage("Packaging workspace...");

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

      setStatusMessage("Downloaded successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error("Backup export failure:", err);
      alert("Failed to export backup.");
      setStatusMessage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage("Reading file...");

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const rawContent = e.target?.result as string;
        if (!rawContent || !rawContent.trim()) {
          throw new Error("The selected file is empty.");
        }

        const parsed = JSON.parse(rawContent);
        const normalized = migrateBackupPayload(parsed);

        // 1. Atomically restore in-memory Zustand store
        restoreWorkspace(normalized);

        // 2. Persist directly to local cache
        const uid = user?.uid || "local";
        try {
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}:${uid}`, JSON.stringify(normalized));
        } catch {}

        // 3. Persist to Firestore if authenticated cloud user
        if (uid !== "local") {
          try {
            await persistWorkspace(uid, normalized);
          } catch (cloudErr) {
            console.warn("Cloud backup write deferred:", cloudErr);
          }
        }

        const counts = [
          `${normalized.columns.length} Folders`,
          `${normalized.links.length} Links`,
          `${normalized.todos.length} Tasks`,
          `${normalized.notes?.length ?? 0} Notes`,
          `${normalized.reports?.length ?? 0} Gym Reports`,
        ].join(", ");

        setStatusMessage(`Restored: ${counts}`);
        alert(`Backup Restored Successfully!\n\nImported:\n${counts}`);
      } catch (err) {
        console.error("Restore failed:", err);
        const msg = err instanceof Error ? err.message : "Invalid JSON backup file.";
        setStatusMessage(`Import failed: ${msg}`);
        alert(`Failed to restore backup: ${msg}`);
      } finally {
        setIsProcessing(false);
        if (event.target) {
          event.target.value = "";
        }
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setStatusMessage("Error reading file.");
      alert("Could not read the selected backup file.");
    };

    reader.readAsText(file);
  };

  return {
    exportBackup,
    triggerImportClick,
    importBackup,
    fileInputRef,
    isProcessing,
    statusMessage,
  };
}