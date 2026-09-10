import { useCallback, useEffect, useMemo, useRef } from "react";
import { createId } from "@/lib/id";
import { useWorkspaceStore, selectTodos } from "@/stores/workspaceStore";
import { addDays, getTodayDate, getWeekEnd, getWeekStart } from "@/lib/date";
import type { TodoItem, TaskPriority } from "@/types/workspace";

function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function ensureReminderPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  if (
    Notification.permission === "granted" ||
    Notification.permission === "denied"
  ) {
    return Notification.permission;
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export type TodoCreateInput = {
  text: string;
  dueDate?: string;
  dueTime?: string;
  reminder?: boolean;
  priority?: TaskPriority;
};

export type TodoPatch = Partial<
  Pick<
    TodoItem,
    | "text"
    | "dueDate"
    | "dueTime"
    | "reminder"
    | "priority"
    | "done"
  >
>;

export function useTasks() {
  const todos = useWorkspaceStore(selectTodos);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  const timersRef = useRef<Map<string, number>>(new Map());
  const triggeredIdsRef = useRef<Set<string>>(new Set());

  const today = getTodayDate();
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  const clearTimer = useCallback((id: string) => {
    const existing = timersRef.current.get(id);
    if (existing !== undefined) {
      window.clearTimeout(existing);
      timersRef.current.delete(id);
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current.clear();
  }, []);

  const fireNotification = useCallback(async (task: TodoItem) => {
    if (!isNotificationSupported() || Notification.permission !== "granted") {
      return;
    }

    if (triggeredIdsRef.current.has(task.id)) {
      return;
    }
    triggeredIdsRef.current.add(task.id);

    const title = task.text;
    const options: NotificationOptions = {
      body: `Reminder due at ${task.dueTime || "09:00"}`,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: `todo-reminder-${task.id}`,
    };

    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, options);
        return;
      } catch {
        // Fallback below
      }
    }

    try {
      new Notification(title, options);
    } catch {
      // Suppressed
    }
  }, []);

  const scheduleTimer = useCallback(
    (task: TodoItem) => {
      clearTimer(task.id);

      if (!task.reminder || !task.dueDate || task.done) {
        return;
      }

      if (!isNotificationSupported() || Notification.permission !== "granted") {
        return;
      }

      const targetDate = new Date(`${task.dueDate}T${task.dueTime || "09:00"}`);
      const delay = targetDate.getTime() - Date.now();

      if (delay <= 0 && delay > -60000) {
        void fireNotification(task);
        return;
      }

      if (delay > 0 && delay <= 2147483647) {
        const timerId = window.setTimeout(() => {
          void fireNotification(task);
          timersRef.current.delete(task.id);
        }, delay);

        timersRef.current.set(task.id, timerId);
      }
    },
    [clearTimer, fireNotification],
  );

  const add = useCallback(
    (input: TodoCreateInput) => {
      const trimmedText = input.text.trim();
      if (!trimmedText) return;

      const todo: TodoItem = {
        id: createId("todo"),
        text: trimmedText,
        done: false,
        date: getTodayDate(),
        dueDate: input.dueDate ?? getTodayDate(),
        dueTime: input.dueTime,
        reminder: Boolean(input.reminder),
        priority: input.priority,
      };

      setWorkspace((prev) => ({
        ...prev,
        todos: [...prev.todos, todo],
      }));

      if (todo.reminder) {
        scheduleTimer(todo);
      }
    },
    [setWorkspace, scheduleTimer],
  );

  const update = useCallback(
    (id: string, patch: TodoPatch) => {
      const current = useWorkspaceStore
        .getState()
        .workspace.todos.find((t) => t.id === id);

      if (!current) return;

      const updated: TodoItem = {
        ...current,
        ...patch,
        id,
      };

      if (patch.reminder || patch.dueDate || patch.dueTime) {
        triggeredIdsRef.current.delete(id);
      }

      setWorkspace((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => (t.id === id ? updated : t)),
      }));

      if (updated.done || !updated.reminder) {
        clearTimer(id);
      } else {
        scheduleTimer(updated);
      }
    },
    [setWorkspace, clearTimer, scheduleTimer],
  );

  const toggle = useCallback(
    (id: string) => {
      setWorkspace((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => {
          if (t.id !== id) return t;
          const next: TodoItem = {
            ...t,
            done: !t.done,
            date: getTodayDate(),
          };

          if (next.done) {
            clearTimer(id);
          } else if (next.reminder) {
            triggeredIdsRef.current.delete(id);
            scheduleTimer(next);
          }

          return next;
        }),
      }));
    },
    [setWorkspace, clearTimer, scheduleTimer],
  );

  const remove = useCallback(
    (id: string) => {
      clearTimer(id);
      triggeredIdsRef.current.delete(id);
      setWorkspace((prev) => ({
        ...prev,
        todos: prev.todos.filter((t) => t.id !== id),
      }));
    },
    [setWorkspace, clearTimer],
  );

  const moveToNextWeek = useCallback(
    (id: string) => {
      setWorkspace((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => {
          if (t.id !== id) return t;
          const nextWeekStart = addDays(weekEnd, 1);
          return {
            ...t,
            dueDate: nextWeekStart,
          };
        }),
      }));
    },
    [setWorkspace, weekEnd],
  );

  const moveToThisWeek = useCallback(
    (id: string) => {
      setWorkspace((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            dueDate: getTodayDate(),
          };
        }),
      }));
    },
    [setWorkspace],
  );

  // Split tasks by current calendar week bounds
  const { thisWeek, nextWeek } = useMemo(() => {
    const thisList: TodoItem[] = [];
    const nextList: TodoItem[] = [];

    todos.forEach((todo) => {
      // Anything due on or before Sunday of this week belongs to This Week
      if (!todo.dueDate || todo.dueDate <= weekEnd) {
        thisList.push(todo);
      } else {
        nextList.push(todo);
      }
    });

    const sortTasks = (list: TodoItem[]): TodoItem[] =>
      [...list].sort((a, b) => Number(a.done) - Number(b.done));

    return {
      thisWeek: sortTasks(thisList),
      nextWeek: sortTasks(nextList),
    };
  }, [todos, weekEnd]);

  // Clean rollover: incomplete tasks from prior to this week roll forward to TODAY
  useEffect(() => {
    let needsRollover = false;
    const currentToday = getTodayDate();

    const rolled = todos.map((todo) => {
      if (todo.done) return todo;
      const due = todo.dueDate ?? todo.date;
      // Overdue tasks from before this week get brought forward to Today
      if (due && due < weekStart) {
        needsRollover = true;
        return {
          ...todo,
          dueDate: currentToday,
        };
      }
      return todo;
    });

    if (needsRollover) {
      setWorkspace((prev) => ({
        ...prev,
        todos: rolled,
      }));
      return;
    }

    todos.forEach((todo) => {
      if (todo.reminder && !todo.done) {
        scheduleTimer(todo);
      }
    });

    const interval = window.setInterval(() => {
      todos.forEach((todo) => {
        if (todo.reminder && !todo.done && todo.dueDate) {
          const target = new Date(`${todo.dueDate}T${todo.dueTime || "09:00"}`).getTime();
          const diff = target - Date.now();
          if (diff <= 0 && diff > -120000 && !triggeredIdsRef.current.has(todo.id)) {
            void fireNotification(todo);
          }
        }
      });
    }, 20000);

    return () => {
      window.clearInterval(interval);
      clearAllTimers();
    };
  }, [todos, setWorkspace, scheduleTimer, clearAllTimers, fireNotification, weekStart]);

  return {
    thisWeek,
    nextWeek,
    add,
    update,
    toggle,
    remove,
    moveToNextWeek,
    moveToThisWeek,
  };
}