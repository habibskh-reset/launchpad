import { useState, useMemo, type FormEvent, useEffect } from "react";
import { 
  Zap, 
  ListTodo, 
  FileText, 
  Check, 
  Search, 
  ExternalLink, 
  Compass, 
  BarChart3, 
  ArrowRight,
  Command
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTasks } from "@/pages/Tasks/useTasks";
import { useNotes } from "@/pages/Notes/useNotes";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useUIStore, type ActiveTab } from "@/stores/uiStore";
import { getTodayDate } from "@/lib/date";
import { cn } from "@/lib/utils";

interface QuickCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Destination = "today" | "tasks" | "note";

export function QuickCaptureModal({ open, onOpenChange }: QuickCaptureModalProps) {
  const { add: addTask } = useTasks();
  const { addNote } = useNotes();
  const links = useWorkspaceStore((s) => s.workspace.links);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState<Destination>("today");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const resetAndClose = () => {
    setQuery("");
    setDestination("today");
    onOpenChange(false);
  };

  // Live filter bookmarks for instant Raycast navigation
  const matchingLinks = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q || q.length < 2) return [];
    return links.filter(
      (l) => l.title.toLowerCase().includes(q) || (l.description && l.description.toLowerCase().includes(q))
    ).slice(0, 4);
  }, [query, links]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (destination === "today") {
      addTask({
        text: trimmed,
        dueDate: getTodayDate(),
        priority: "medium",
      });
    } else if (destination === "tasks") {
      addTask({
        text: trimmed,
        priority: "medium",
      });
    } else {
      addNote({
        title: trimmed.slice(0, 40) + (trimmed.length > 40 ? "..." : ""),
        content: trimmed,
        color: "default",
      });
    }

    resetAndClose();
  };

  const handleSwitchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    resetAndClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 overflow-hidden border border-white/10 bg-card/90 backdrop-blur-2xl shadow-2xl rounded-2xl card-hardware">
        {/* Spotlight Search Header */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
          <Command className="h-5 w-5 text-primary/70 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a task, note, or search links..."
            autoFocus
            className="w-full bg-transparent text-sm sm:text-base font-medium placeholder:text-muted-foreground/50 outline-none text-foreground"
          />
          {query && (
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1 shrink-0 shadow-sm cursor-pointer hover:bg-primary/90"
            >
              <span>Add</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </form>

        {/* Quick Launch & Matching Bookmarks Dropdown */}
        <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
          {matchingLinks.length > 0 && (
            <div className="pb-2 mb-2 border-b border-border/40">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Bookmarks
              </div>
              {matchingLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={resetAndClose}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/60 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {link.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate font-mono">
                      {link.description}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                </a>
              ))}
            </div>
          )}

          {/* Quick Tab Switcher Shortcuts */}
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Navigation Shortcuts
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleSwitchTab("tasks")}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/60 text-xs font-medium text-foreground transition-colors cursor-pointer text-left"
            >
              <ListTodo className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="truncate">Tasks & Scratchpad</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab("reports")}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/60 text-xs font-medium text-foreground transition-colors cursor-pointer text-left"
            >
              <BarChart3 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="truncate">Gym Nation</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab("launchpad")}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/60 text-xs font-medium text-foreground transition-colors cursor-pointer text-left"
            >
              <Compass className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="truncate">Resources</span>
            </button>
          </div>
        </div>

        {/* Capture Mode Toggle Footer */}
        <div className="px-4 py-2.5 bg-muted/30 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDestination("today")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer",
                destination === "today"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="h-3 w-3" />
              <span>Today Task</span>
            </button>

            <button
              type="button"
              onClick={() => setDestination("tasks")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer",
                destination === "tasks"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              )}
            >
              <ListTodo className="h-3 w-3" />
              <span>Week Task</span>
            </button>

            <button
              type="button"
              onClick={() => setDestination("note")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer",
                destination === "note"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-3 w-3" />
              <span>Scratchpad</span>
            </button>
          </div>

          <span className="text-[10px] text-muted-foreground font-mono">
            ESC to close • Enter to capture
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}