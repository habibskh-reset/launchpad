import { useState, useMemo, type FormEvent } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Check, 
  CheckCircle2, 
  ListTodo, 
  Pencil, 
  Plus, 
  Trash2, 
  FileText, 
  Pin, 
  Edit3
} from "lucide-react";
import { useTasks } from "./useTasks";
import { useNotes } from "@/pages/Notes/useNotes";
import { NoteModal } from "@/pages/Notes/NoteModal";
import { formatDateLabel, getTodayDate, addDays, getWeekStart, getWeekEnd, formatWeekday } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskModal } from "./TaskModal";
import { cn } from "@/lib/utils";
import type { TaskPriority, TodoItem } from "@/types/workspace";
import type { NoteItem } from "@/pages/Notes/notes.types";

type ViewMode = "today" | "thisWeek" | "nextWeek";

const PRIORITIES: { id: TaskPriority; label: string; activeStyle: string }[] = [
  { id: "low", label: "Low", activeStyle: "bg-emerald-500 text-white font-bold" },
  { id: "medium", label: "Med", activeStyle: "bg-amber-500 text-slate-950 font-bold" },
  { id: "high", label: "High", activeStyle: "bg-rose-500 text-white font-bold" },
];

const NOTE_COLORS: Record<string, { bg: string; border: string }> = {
  default: { bg: "bg-card/80", border: "border-border" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/30" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/30" },
  rose: { bg: "bg-rose-500/10", border: "border-rose-500/30" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

export function TasksPage({ searchTerm = "" }: { searchTerm?: string }) {
  const {
    thisWeek,
    nextWeek,
    add,
    update,
    toggle,
    remove,
    moveToNextWeek,
    moveToThisWeek,
  } = useTasks();

  const { notes, addNote, updateNote, togglePin, removeNote } = useNotes();

  const today = getTodayDate();
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  const [mode, setMode] = useState<ViewMode>("today");
  const [draft, setDraft] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null);

  // Notes Modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

  const dateBadge = useMemo(() => {
    if (mode === "today") return formatDateLabel();
    if (mode === "thisWeek") return `${formatWeekday(weekStart)} – ${formatWeekday(weekEnd)}`;
    const nextStart = addDays(weekEnd, 1);
    const nextEnd = addDays(weekEnd, 7);
    return `${formatWeekday(nextStart)} – ${formatWeekday(nextEnd)}`;
  }, [mode, weekStart, weekEnd]);

  const activeTasks = useMemo(() => {
    let list: TodoItem[] = [];
    if (mode === "today") {
      list = thisWeek.filter((t) => !t.dueDate || t.dueDate <= today);
    } else if (mode === "thisWeek") {
      list = thisWeek;
    } else {
      list = nextWeek;
    }

    const q = searchTerm.toLowerCase().trim();
    if (!q) return list;
    return list.filter((t) => t.text.toLowerCase().includes(q));
  }, [mode, thisWeek, nextWeek, today, searchTerm]);

  const filteredNotes = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return notes;
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }, [notes, searchTerm]);

  const completedCount = activeTasks.filter((t) => t.done).length;
  const totalCount = activeTasks.length;

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    add({
      text: trimmed,
      dueDate: mode === "nextWeek" ? addDays(weekEnd, 1) : today,
      priority,
      reminder: false,
    });
    setDraft("");
  };

  const handleSaveNote = (payload: { title: string; content: string; color: NoteItem["color"] }) => {
    if (editingNote) {
      updateNote(editingNote.id, payload);
    } else {
      addNote(payload);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full pb-16">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
            {mode === "today" ? <Calendar className="h-5 w-5" /> : <ListTodo className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-foreground">
                {mode === "today" ? "Today's Agenda" : mode === "thisWeek" ? "This Week" : "Next Week"}
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                {dateBadge}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalCount === 0
                ? "No tasks scheduled."
                : `${completedCount} of ${totalCount} completed (${Math.round(
                    (completedCount / (totalCount || 1)) * 100,
                  )}%)`}
            </p>
          </div>
        </div>

        <div className="flex rounded-xl bg-muted p-1 text-xs font-semibold gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode("today")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all cursor-pointer",
              mode === "today" ? "bg-background text-foreground shadow-sm font-bold" : "text-muted-foreground",
            )}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMode("thisWeek")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all cursor-pointer",
              mode === "thisWeek" ? "bg-background text-foreground shadow-sm font-bold" : "text-muted-foreground",
            )}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => setMode("nextWeek")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all cursor-pointer",
              mode === "nextWeek" ? "bg-background text-foreground shadow-sm font-bold" : "text-muted-foreground",
            )}
          >
            Next Week
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Left Tasks, Right Scratchpad Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Tasks (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-border bg-card/70 backdrop-blur-xl shadow-sm overflow-hidden">
          <form
            onSubmit={handleAddTask}
            className="p-3 border-b border-border bg-background/50 flex items-center gap-2"
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Add task to ${mode === "today" ? "Today" : mode === "thisWeek" ? "This Week" : "Next Week"}...`}
              className="h-10 bg-card border-border rounded-xl text-xs sm:text-sm font-medium focus-visible:ring-primary"
            />
            <div className="flex items-center gap-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer",
                    priority === p.id ? p.activeStyle : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!draft.trim()}
              className="h-10 px-4 rounded-xl font-bold bg-primary text-primary-foreground shrink-0 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          <ul className="p-3 space-y-2 max-h-[520px] overflow-y-auto">
            {activeTasks.length === 0 ? (
              <li className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-1">
                <CheckCircle2 className="h-6 w-6 text-muted-foreground/30 mb-1" />
                <span>No tasks in this view. Type above to add one.</span>
              </li>
            ) : (
              activeTasks.map((task) => (
                <li
                  key={task.id}
                  className={cn(
                    "group flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border bg-card/80 hover:border-primary/40 transition-all shadow-sm",
                    task.done && "opacity-50 bg-muted/20 border-transparent",
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggle(task.id)}
                      className={cn(
                        "w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer",
                        task.done
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-muted-foreground/40 hover:border-primary bg-background",
                      )}
                    >
                      {task.done && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-medium truncate",
                        task.done ? "line-through text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {task.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!task.done && (
                      <button
                        type="button"
                        onClick={() => setEditingTask(task)}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Edit task"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    )}

                    {mode !== "nextWeek" && !task.done && (
                      <button
                        type="button"
                        onClick={() => moveToNextWeek(task.id)}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Move to Next Week"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}

                    {mode === "nextWeek" && !task.done && (
                      <button
                        type="button"
                        onClick={() => moveToThisWeek(task.id)}
                        className="p-1 text-muted-foreground hover:text-emerald-500 cursor-pointer"
                        title="Move to Current Week / Today"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => remove(task.id)}
                      className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Right Side: Colorful Scratchpad Notes (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Scratchpad Notes ({filteredNotes.length})
              </h3>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingNote(null);
                setNoteModalOpen(true);
              }}
              className="rounded-xl font-bold text-xs cursor-pointer h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> New Note
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl bg-card/40">
                No notes captured yet. Click "+ New Note" to save thoughts, links, or ideas.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const color = NOTE_COLORS[note.color ?? "default"] ?? NOTE_COLORS.default;
                return (
                  <div
                    key={note.id}
                    className={cn(
                      "group rounded-2xl border p-3.5 flex flex-col justify-between transition-all shadow-sm",
                      color.bg,
                      color.border,
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-xs text-foreground line-clamp-1">
                          {note.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => togglePin(note.id)}
                          className={cn(
                            "p-1 rounded transition-colors flex-shrink-0 cursor-pointer",
                            note.pinned ? "text-primary font-bold" : "text-muted-foreground/40 hover:text-foreground",
                          )}
                        >
                          <Pin className="h-3 w-3" fill={note.pinned ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4 leading-relaxed font-medium">
                        {note.content}
                      </p>
                    </div>

                    <div className="pt-3 flex items-center justify-between border-t border-border/40 mt-3 text-[10px] text-muted-foreground">
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNote(note);
                            setNoteModalOpen(true);
                          }}
                          className="p-1 rounded hover:bg-background/80 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeNote(note.id)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <TaskModal
        open={Boolean(editingTask)}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask}
        onSave={(id, patch) => update(id, patch)}
      />

      <NoteModal
        open={noteModalOpen}
        onOpenChange={setNoteModalOpen}
        note={editingNote}
        onSave={handleSaveNote}
      />
    </div>
  );
}