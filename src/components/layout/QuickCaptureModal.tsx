import { useState, type FormEvent } from "react";
import { Zap, ListTodo, FileText, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/pages/Tasks/useTasks";
import { useNotes } from "@/pages/Notes/useNotes";
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

  const [text, setText] = useState("");
  const [destination, setDestination] = useState<Destination>("today");

  const resetAndClose = () => {
    setText("");
    setDestination("today");
    onOpenChange(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Universal Quick Capture</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a thought, task, or note..."
            rows={3}
            autoFocus
            className="w-full rounded-xl border border-border bg-background p-3 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDestination("today")}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  destination === "today"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border bg-muted/60 text-muted-foreground hover:text-foreground",
                )}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Today</span>
              </button>

              <button
                type="button"
                onClick={() => setDestination("tasks")}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  destination === "tasks"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border bg-muted/60 text-muted-foreground hover:text-foreground",
                )}
              >
                <ListTodo className="h-3.5 w-3.5" />
                <span>Week</span>
              </button>

              <button
                type="button"
                onClick={() => setDestination("note")}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  destination === "note"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border bg-muted/60 text-muted-foreground hover:text-foreground",
                )}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Note</span>
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button type="button" variant="secondary" size="sm" onClick={resetAndClose} className="rounded-xl text-xs cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!text.trim()} className="rounded-xl font-bold bg-primary text-primary-foreground shadow-sm text-xs cursor-pointer">
                <Check className="h-3.5 w-3.5 mr-1" />
                Capture
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}