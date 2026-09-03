import { type FormEvent, useState } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  ListTodo,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ensureReminderPermission, useTodos } from "./useTodos";
import {
  formatDateLabel,
  formatWeekday,
  getTodayDate,
  getWeekDays,
  addDays,
} from "@/lib/date";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TaskPriority, TodoItem } from "@/types/workspace";

type WeekTab = "this" | "next";

const PRIORITIES: { id: TaskPriority; label: string; activeStyle: string }[] = [
  { id: "low", label: "Low", activeStyle: "bg-emerald-500 text-white font-bold border-emerald-600 shadow-sm" },
  { id: "medium", label: "Med", activeStyle: "bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-sm" },
  { id: "high", label: "High", activeStyle: "bg-rose-500 text-white font-bold border-rose-600 shadow-sm" },
];

export function TodoSection({ searchTerm = "" }: { searchTerm?: string }) {
  const { thisWeek, nextWeek, add, update, toggle, remove, moveToNextWeek } =
    useTodos();
  const weekDays = getWeekDays();
  const today = getTodayDate();

  const [tab, setTab] = useState<WeekTab>("this");
  const [draft, setDraft] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [reminder, setReminder] = useState(false);
  const [remindDate, setRemindDate] = useState(today);
  const [remindTime, setRemindTime] = useState("09:00");
  const [editingId, setEditingId] = useState<string | null>(null);

  const rawItems = tab === "this" ? thisWeek : nextWeek;
  const items = searchTerm.trim()
    ? rawItems.filter((t) => t.text.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    : rawItems;

  const handleReminderToggle = async (checked: boolean) => {
    if (!checked) {
      setReminder(false);
      return;
    }
    const perm = await ensureReminderPermission();
    if (perm === "granted") {
      setReminder(true);
      setRemindDate(today);
    } else {
      alert("Please enable notification permissions in your browser to set task reminders.");
      setReminder(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    add({
      text: trimmed,
      dueDate: reminder ? remindDate : tab === "this" ? today : addDays(today, 7),
      dueTime: reminder ? remindTime : undefined,
      reminder,
      priority,
    });

    setDraft("");
    setReminder(false);
  };

  return (
    <section className="rounded-2xl border border-border bg-card/70 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header with clear Tab Switching */}
      <div className="px-4 py-3.5 flex items-center justify-between border-b border-border bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ListTodo className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-foreground">Tasks</h2>
            <p className="text-[11px] text-muted-foreground">{formatDateLabel()}</p>
          </div>
        </div>

        <div className="flex rounded-xl bg-muted p-1 text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => setTab("this")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all",
              tab === "this"
                ? "bg-background text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            This Week
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
              {thisWeek.filter((t) => !t.done).length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("next")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all",
              tab === "next"
                ? "bg-background text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Next Week
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
              {nextWeek.filter((t) => !t.done).length}
            </span>
          </button>
        </div>
      </div>

      {/* Task Creation Form */}
      <form onSubmit={handleSubmit} className="p-3.5 border-b border-border bg-background/50 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a new task..."
            className="h-10 bg-card border-border rounded-xl text-xs sm:text-sm font-medium focus-visible:ring-primary"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!draft.trim()}
            className="h-10 px-4 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20 shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          {/* Priority Selection Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1">Priority:</span>
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={cn(
                  "px-3 py-1 rounded-lg border text-[11px] font-semibold transition-all",
                  priority === p.id
                    ? p.activeStyle
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Reminder Toggle Button */}
          <button
            type="button"
            onClick={() => void handleReminderToggle(!reminder)}
            className={cn(
              "px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all",
              reminder
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>{reminder ? "Reminder Active" : "Set Reminder"}</span>
          </button>
        </div>

        {/* Synced Reminder Settings */}
        {reminder && (
          <div className="p-3 rounded-xl bg-card border border-primary/30 flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground font-medium text-[11px]">
              <span>Notify on:</span>
            </div>
            <select
              value={remindDate}
              onChange={(e) => setRemindDate(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground font-medium outline-none focus:ring-1 focus:ring-primary"
            >
              {weekDays.map((d) => (
                <option key={d.date} value={d.date}>
                  {d.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={remindDate}
              onChange={(e) => setRemindDate(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground font-medium outline-none focus:ring-1 focus:ring-primary"
            />

            <input
              type="time"
              value={remindTime}
              onChange={(e) => setRemindTime(e.target.value)}
              className="h-8 px-2 rounded-lg bg-background border border-border text-xs text-foreground font-medium outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
      </form>

      {/* Task List */}
      <ul className="p-3 space-y-2 flex-1 min-h-[160px] overflow-y-auto">
        {items.length === 0 ? (
          <li className="py-12 text-center text-xs text-muted-foreground">
            {searchTerm.trim()
              ? "No tasks match your search."
              : `No tasks scheduled for ${tab === "this" ? "this week" : "next week"}.`}
          </li>
        ) : (
          items.map((task) =>
            editingId === task.id ? (
              <TodoEditRow
                key={task.id}
                task={task}
                weekDays={weekDays}
                onCancel={() => setEditingId(null)}
                onSave={(patch) => {
                  update(task.id, patch);
                  setEditingId(null);
                }}
              />
            ) : (
              <TodoItemRow
                key={task.id}
                task={task}
                showMove={tab === "this" && !task.done}
                onEdit={() => setEditingId(task.id)}
                onToggle={() => toggle(task.id)}
                onDelete={() => remove(task.id)}
                onMove={() => moveToNextWeek(task.id)}
              />
            ),
          )
        )}
      </ul>
    </section>
  );
}

function TodoEditRow({
  task,
  weekDays,
  onCancel,
  onSave,
}: {
  task: TodoItem;
  weekDays: { date: string; label: string }[];
  onCancel: () => void;
  onSave: (patch: {
    text: string;
    priority: TaskPriority;
    reminder: boolean;
    dueDate?: string;
    dueTime?: string;
  }) => void;
}) {
  const [text, setText] = useState(task.text);
  const [priority, setPriority] = useState<TaskPriority>(task.priority ?? "medium");
  const [reminder, setReminder] = useState(Boolean(task.reminder));
  const [dueDate, setDueDate] = useState(task.dueDate ?? getTodayDate());
  const [dueTime, setDueTime] = useState(task.dueTime ?? "09:00");

  return (
    <li className="p-3.5 rounded-xl border border-primary/50 bg-card shadow-md space-y-3">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={180}
        autoFocus
        className="h-10 text-xs sm:text-sm font-medium"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPriority(p.id)}
              className={cn(
                "px-2.5 py-1 rounded-md border text-[10px] font-bold",
                priority === p.id
                  ? p.activeStyle
                  : "border-border bg-muted/60 text-muted-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="h-8 px-3 rounded-lg text-xs">
            <X className="h-3.5 w-3.5 mr-1" />
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!text.trim()}
            className="h-8 px-4 text-xs font-bold rounded-lg"
            onClick={() =>
              onSave({
                text,
                priority,
                reminder,
                dueDate: reminder ? dueDate : task.dueDate,
                dueTime: reminder ? dueTime : undefined,
              })
            }
          >
            Save Changes
          </Button>
        </div>
      </div>
    </li>
  );
}

function TodoItemRow({
  task,
  showMove,
  onEdit,
  onToggle,
  onDelete,
  onMove,
}: {
  task: TodoItem;
  showMove: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onMove: () => void;
}) {
  const priorityColor =
    task.priority === "high"
      ? "text-rose-500 bg-rose-500/10 border-rose-500/30"
      : task.priority === "medium"
        ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
        : "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";

  return (
    <li
      className={cn(
        "group flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 transition-all shadow-sm",
        task.done && "opacity-50 bg-muted/30 border-transparent",
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onToggle}
          aria-label={task.done ? "Mark incomplete" : "Complete"}
          className={cn(
            "w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer",
            task.done
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-muted-foreground/40 hover:border-primary bg-background",
          )}
        >
          {task.done && <Check className="h-3 w-3 stroke-[3]" />}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-xs sm:text-sm font-semibold leading-snug truncate",
              task.done ? "line-through text-muted-foreground" : "text-foreground",
            )}
          >
            {task.text}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {task.priority && (
              <span
                className={cn(
                  "px-2 py-0.2 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                  priorityColor,
                )}
              >
                {task.priority}
              </span>
            )}
            {task.reminder && task.dueDate && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                <Bell className="h-3 w-3 text-primary" />
                {formatWeekday(task.dueDate)} · {task.dueTime || "09:00"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Touch-accessible Action Buttons */}
      <div className="flex items-center gap-1">
        {!task.done && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Edit task"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        {showMove && (
          <button
            type="button"
            onClick={onMove}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Move to next week"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}