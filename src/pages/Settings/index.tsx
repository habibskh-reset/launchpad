import { Link } from "react-router-dom";
import { ArrowLeft, Download, Upload, CheckCircle2, Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBackup } from "./useBackup";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { SecuritySettings } from "./SecuritySettings";

export function SettingsPage() {
  const { exportBackup, importBackup, isProcessing, statusMessage } = useBackup();
  const user = useWorkspaceStore((s) => s.user);
  const folderCount = useWorkspaceStore((s) => s.workspace.columns.length);
  const linkCount = useWorkspaceStore((s) => s.workspace.links.length);
  const todoCount = useWorkspaceStore((s) => s.workspace.todos.length);
  const noteCount = useWorkspaceStore((s) => s.workspace.notes?.length ?? 0);
  const reportCount = useWorkspaceStore((s) => s.workspace.reports?.length ?? 0);

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-6 pb-20 lg:pb-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg cursor-pointer">
              <Link to="/dashboard" aria-label="Back to Dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold tracking-tight">Settings & Security</h1>
          </div>
          <p className="text-xs text-muted-foreground ml-10">
            Signed in as {user?.email ?? "anonymous"}
          </p>
        </div>
      </header>

      <SecuritySettings />

      <Card className="p-5 space-y-3">
        <h2 className="font-medium text-sm">Workspace Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <Stat label="Folders" value={folderCount} />
          <Stat label="Links" value={linkCount} />
          <Stat label="Todos" value={todoCount} />
          <Stat label="Notes" value={noteCount} />
          <Stat label="Gym Reports" value={reportCount} highlight />
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-sm">Backup & Restore Pipeline</h2>
            <p className="text-xs text-muted-foreground">
              Direct JSON file sync compatible with your Google Drive backup folder.
            </p>
          </div>
          {statusMessage && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={exportBackup}
            disabled={isProcessing}
            variant="default"
            className="cursor-pointer font-bold text-xs rounded-xl h-9"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export Complete Backup
          </Button>

          <Button
            asChild
            variant="secondary"
            disabled={isProcessing}
            className="cursor-pointer font-bold text-xs rounded-xl h-9 border border-border"
          >
            <label className="cursor-pointer">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Restore from Drive / File
              <input
                type="file"
                accept=".json"
                onChange={importBackup}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </Card>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-muted/60 border ${
        highlight ? "border-primary/40 bg-primary/5" : "border-border"
      } p-3 transition-colors`}
    >
      <div className={`text-xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </div>
      <div className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5 tracking-wider">
        {label}
      </div>
    </div>
  );
}