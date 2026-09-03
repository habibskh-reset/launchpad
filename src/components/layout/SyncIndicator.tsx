import { useWorkspaceStore } from "@/stores/workspaceStore";
import { cn } from "@/lib/utils";

export function SyncIndicator() {
  const sync = useWorkspaceStore((s) => s.sync);
  const dot =
    sync.status === "active"
      ? "bg-success"
      : sync.status === "error"
        ? "bg-destructive"
        : "bg-muted-foreground/50";
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground leading-none">
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} aria-hidden />
      <span className="truncate">{sync.message}</span>
    </div>
  );
}
