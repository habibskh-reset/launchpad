import { Download, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBackup } from "@/features/settings/useBackup";
import { useWorkspaceStore } from "@/stores/workspaceStore";

export function SettingsPage() {
  const { exportBackup, importBackup } = useBackup();
  const user = useWorkspaceStore((s) => s.user);
  const folderCount = useWorkspaceStore((s) => s.workspace.columns.length);
  const linkCount = useWorkspaceStore((s) => s.workspace.links.length);
  const todoCount = useWorkspaceStore((s) => s.workspace.todos.length);

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-6 pb-20 lg:pb-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user?.email ?? "anonymous"}
        </p>
      </header>

      <Card className="p-5 space-y-3">
        <h2 className="font-medium text-sm">Workspace overview</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Folders" value={folderCount} />
          <Stat label="Links" value={linkCount} />
          <Stat label="Todos" value={todoCount} />
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="font-medium text-sm">Backup & restore</h2>
        <p className="text-sm text-muted-foreground">
          Export your workspace as JSON, or import a previous backup. Imports
          overwrite the current workspace and sync to the cloud.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportBackup} variant="default">
            <Download className="h-3.5 w-3.5" />
            Export Backup
          </Button>
          <Button asChild variant="secondary">
            <label className="cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              Import Backup
              <input
                type="file"
                accept=".json"
                onChange={importBackup}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </Card>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted border border-border p-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
