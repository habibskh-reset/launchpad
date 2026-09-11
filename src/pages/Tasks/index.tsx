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
  Edit3,
  Bell,
  Eye,
  Clock
} from "lucide-react";
import { useTasks } from "./useTasks";
import { useNotes } from "@/pages/Notes/useNotes";
import { NoteModal } from "@/pages/Notes/NoteModal";
import { NoteViewModal } from "@/pages/Notes/NoteViewModal";
import { useConfirmDialog } from "@/components/shared/ConfirmDialog";
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
  const { confirm, ConfirmDialogElement } = useConfirmDialog();

  const today = getTodayDate();
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  const [mode, setMode] = useState<ViewMode>("today");
  const [draft, setDraft] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null);

  // Quick Input Reminder fields
  const [showReminderOptions, setShowReminderOptions] = useState(false);
  const [quickTime, setQuickTime] = useState("09:00");
  const [quickReminder, setQuickReminder] = useState(false);

  // Notes Modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteViewOpen, setNoteViewOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<NoteItem | null>(null);

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
      dueTime: quickReminder ? quickTime : undefined,
      reminder: quickReminder,
      reminderOffset: 0,
      audioAlert: true,
      priority,
    });

    setDraft("");
    setQuickReminder(false);
    setShowReminderOptions(false);
  };

  const handleDeleteNote = async (note: NoteItem) => {
    const ok = await confirm(`Permanently delete note "${note.title}"?`);
    if (ok) {
      removeNote(note.id);
    }
  };

  const handleSaveNote = (payload: { title: string; content: string; color: NoteItem["color"] }) => {
    if (activeNote) {
      updateNote(activeNote.id, payload);
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

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Tasks (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-border bg-card/70 backdrop-blur-xl shadow-sm overflow-hidden">
          <form onSubmit={handleAddTask} className="p-3 border-b border-border bg-background/50 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Add task to ${mode === "today" ? "Today" : mode === "thisWeek" ? "This Week" : "Next Week"}...`}
                className="h-10 bg-card border-border rounded-xl text-xs sm:text-sm font-medium focus-visible:ring-primary"
              />
              
              {/* Priority Selectors */}
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

              {/* Quick Reminder Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setShowReminderOptions((prev) => !prev);
                  if (!showReminderOptions) setQuickReminder(true);
                }}
                className={cn(
                  "h-10 px-2.5 rounded-xl border flex items-center gap-1 text-xs transition-colors cursor-pointer shrink-0",
                  quickReminder ? "bg-amber-500/10 border-amber-500/40 text-amber-500 font-bold" : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
                title="Configure reminder for this task"
              >
                <Bell className="h-4 w-4" />
              </button>

              <Button
                type="submit"
                size="sm"
                disabled={!draft.trim()}
                className="h-10 px-4 rounded-xl font-bold bg-primary text-primary-foreground shrink-0 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Reminder Bar Drawer */}
            {showReminderOptions && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border text-xs animate-in fade-in-50">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-[11px]">Reminder Time:</span>
                  <input
                    type="time"
                    value={quickTime}
                    onChange={(e) => setQuickTime(e.target.value)}
                    className="h-7 px-2 rounded-md bg-background border border-input text-xs font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-medium cursor-pointer flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={quickReminder}
                      onChange={(e) => setQuickReminder(e.target.checked)}
                      className="rounded"
                    />
                    <span>Alarm Active</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowReminderOptions(false)}
                    className="text-[10px] text-muted-foreground hover:text-foreground underline ml-2"
                  >
                    Hide
                  </button>
                </div>
              </div>
            )}
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
                    <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium truncate",
                          task.done ? "line-through text-muted-foreground" : "text-foreground",
                        )}
                      >
                        {task.text}
                      </span>
                      {task.reminder && (
                        <span
                          className={cn(
                            "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0",
                            task.reminderStatus === "triggered"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-primary/10 text-primary"
                          )}
                          title={task.reminderOffset ? `${task.reminderOffset}m before` : "At due time"}
                        >
                          <Bell className="h-3 w-3" />
                          <span>{task.dueTime || "09:00"}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!task.done && (
                      <button
                        type="button"
                        onClick={() => setEditingTask(task)}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Edit task & reminder"
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

        {/* Right Side: Scratchpad Notes (5 cols) */}
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
                setActiveNote(null);
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
                      "group rounded-2xl border p-3.5 flex flex-col justify-between transition-all shadow-sm cursor-pointer hover:border-primary/40",
                      color.bg,
                      color.border,
                    )}
                    onClick={() => {
                      setActiveNote(note);
                      setNoteViewOpen(true);
                    }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-xs text-foreground line-clamp-1">
                          {note.title}
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(note.id);
                          }}
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

                    <div 
                      className="pt-3 flex items-center justify-between border-t border-border/40 mt-3 text-[10px] text-muted-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNote(note);
                            setNoteViewOpen(true);
                          }}
                          className="px-2 py-0.5 rounded bg-muted/80 hover:bg-muted text-foreground transition-colors flex items-center gap-1 font-medium text-[10px]"
                          title="View"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNote(note);
                            setNoteModalOpen(true);
                          }}
                          className="px-2 py-0.5 rounded bg-muted/80 hover:bg-muted text-foreground transition-colors flex items-center gap-1 font-medium text-[10px]"
                          title="Edit"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note)}
                          className="p-1 rounded hover:bg-destructive/10 text-destructive/70 hover:text-destructive cursor-pointer ml-1"
                          title="Delete"
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
        note={activeNote}
        onSave={handleSaveNote}
      />

      <NoteViewModal
        open={noteViewOpen}
        onOpenChange={setNoteViewOpen}
        note={activeNote}
        onEdit={(note) => {
          setActiveNote(note);
          setNoteModalOpen(true);
        }}
      />

      {ConfirmDialogElement}
    </div>
  );
}