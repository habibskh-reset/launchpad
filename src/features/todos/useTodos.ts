import { useCallback, useEffect, useMemo } from "react";
import { useWorkspaceStore, selectTodos } from "@/stores/workspaceStore";
import { addDays, getTodayDate, getWeekEnd, getWeekStart } from "@/lib/date";
import type { TodoItem, TaskPriority } from "@/types/workspace";

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const reminderTimers: Record<string, number> = {};

function notificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function ensureReminderPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationSupported()) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return Notification.requestPermission();
}

function clearReminder(id: string) {
  if (reminderTimers[id]) {
    clearTimeout(reminderTimers[id]);
    delete reminderTimers[id];
  }
}

function scheduleReminder(task: TodoItem) {
  clearReminder(task.id);
  if (!task.reminder || !task.dueDate || task.done) return;
  if (!notificationSupported() || Notification.permission !== "granted") return;

  const due = new Date(`${task.dueDate}T${task.dueTime || "09:00"}`);
  const delay = due.getTime() - Date.now();
  if (delay <= 0) return;

  reminderTimers[task.id] = window.setTimeout(() => {
    new Notification(task.text, {
      body: `Reminder · ${task.dueTime || "09:00"}`,
      icon: "/favicon.svg",
    });
    delete reminderTimers[task.id];
  }, Math.min(delay, 2147483647));
}

export type TodoPatch = Partial<
  Pick<TodoItem, "text" | "dueDate" | "dueTime" | "reminder" | "priority" | "done">
>;

export function useTodos() {
  const todos = useWorkspaceStore(selectTodos);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  const weekEnd = getWeekEnd();

  const add = useCallback(
    (input: {
      text: string;
      dueDate?: string;
      dueTime?: string;
      reminder?: boolean;
      priority: TaskPriority;
    }) => {
      const trimmed = input.text.trim();
      if (!trimmed) return;
      if (!input.priority) return;
      const next: TodoItem = {
        id: nextId("todo"),
        text: trimmed,
        done: false,
        dueDate: input.dueDate ?? getTodayDate(),
        dueTime: input.reminder ? input.dueTime || "09:00" : undefined,
        reminder: Boolean(input.reminder),
        priority: input.priority,
        date: getTodayDate(),
      };
      setWorkspace((prev) => ({ ...prev, todos: [...prev.todos, next] }));
      if (next.reminder) scheduleReminder(next);
    },
    [setWorkspace],
  );

  const update = useCallback(
    (id: string, patch: TodoPatch) => {
      setWorkspace((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => {
          if (t.id !== id) return t;
          const next = { ...t, ...patch };
          if (patch.text !== undefined) next.text = patch.text.trim() || t.text;
          if (!next.reminder) {
            next.dueTime = undefined;
            clearReminder(id);
          } else {
            next.dueTime = next.dueTime || "09:00";
            next.dueDate = next.dueDate ?? getTodayDate();
            scheduleReminder(next);
          }
          return next;
        }),
      }));
    },
    [setWorkspace],
  );

  const toggle = useCallback(
    (id: string) => {
      setWorkspace((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => {
          if (t.id !== id) return t;
          const next = { ...t, done: !t.done, date: getTodayDate() };
          if (next.done) clearReminder(id);
          else if (next.reminder) scheduleReminder(next);
          return next;
        }),
      }));
    },
    [setWorkspace],
  );

  const remove = useCallback(
    (id: string) => {
      clearReminder(id);
      setWorkspace((prev) => ({
        ...prev,
        todos: prev.todos.filter((t) => t.id !== id),
      }));
    },
    [setWorkspace],
  );

  const moveToNextWeek = useCallback(
    (id: string) => {
      setWorkspace((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => {
          if (t.id !== id) return t;
          const base = t.dueDate ?? getTodayDate();
          const nextDate = base > weekEnd ? addDays(base, 7) : addDays(weekEnd, 1);
          const next = { ...t, dueDate: nextDate };
          if (next.reminder) scheduleReminder(next);
          return next;
        }),
      }));
    },
    [setWorkspace, weekEnd],
  );

  const { thisWeek, nextWeek } = useMemo(() => {
    const thisList: TodoItem[] = [];
    const nextList: TodoItem[] = [];
    todos.forEach((t) => {
      if (!t.dueDate || t.dueDate <= weekEnd) thisList.push(t);
      else nextList.push(t);
    });
    const sortTasks = (list: TodoItem[]) =>
      [...list].sort((a, b) => Number(a.done) - Number(b.done));
    return { thisWeek: sortTasks(thisList), nextWeek: sortTasks(nextList) };
  }, [todos, weekEnd]);

  useEffect(() => {
    const weekStart = getWeekStart();
    const nextWeekStart = addDays(getWeekEnd(), 1);
    let changed = false;
    const rolled = todos.map((t) => {
      if (t.done) return t;
      const due = t.dueDate ?? t.date;
      if (!due || due >= weekStart) return t;
      changed = true;
      const next = { ...t, dueDate: nextWeekStart };
      if (next.reminder) scheduleReminder(next);
      return next;
    });
    if (changed) {
      setWorkspace((prev) => ({ ...prev, todos: rolled }));
      return;
    }
    todos.forEach((t) => {
      if (t.reminder && !t.done) scheduleReminder(t);
    });
  }, [todos, setWorkspace]);

  return {
    thisWeek,
    nextWeek,
    add,
    update,
    toggle,
    remove,
    moveToNextWeek,
  };
}
