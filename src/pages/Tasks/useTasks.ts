import { useCallback, useEffect, useMemo } from "react";
import { createId } from "@/lib/id";
import { useWorkspaceStore, selectTodos } from "@/stores/workspaceStore";
import { addDays, getTodayDate, getWeekEnd, getWeekStart } from "@/lib/date";
import type { TodoItem, TaskPriority, ReminderStatus } from "@/types/workspace";

export type TodoCreateInput = {
  text: string;
  dueDate?: string;
  dueTime?: string;
  reminder?: boolean;
  reminderOffset?: number;
  audioAlert?: boolean;
  priority?: TaskPriority;
};

export type TodoPatch = Partial<
  Pick<
    TodoItem,
    | "text"
    | "dueDate"
    | "dueTime"
    | "reminder"
    | "reminderOffset"
    | "reminderStatus"
    | "audioAlert"
    | "priority"
    | "done"
  >
>;

export function useTasks() {
  const todos = useWorkspaceStore(selectTodos);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

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
        reminderOffset: input.reminderOffset ?? 0,
        reminderStatus: input.reminder ? "pending" : undefined,
        audioAlert: input.audioAlert ?? true,
        priority: input.priority,
      };

      setWorkspace((prev) => ({
        ...prev,
        todos: [...prev.todos, todo],
      }));
    },
    [setWorkspace],
  );

  const update = useCallback(
    (id: string, patch: TodoPatch) => {
      const current = useWorkspaceStore
        .getState()
        .workspace.todos.find((t) => t.id === id);

      if (!current) return;

      const resetTrigger =
        Boolean(patch.reminder && !current.reminder) ||
        Boolean(patch.dueDate && patch.dueDate !== current.dueDate) ||
        Boolean(patch.dueTime && patch.dueTime !== current.dueTime) ||
        Boolean(patch.reminderOffset !== undefined && patch.reminderOffset !== current.reminderOffset);

      const updated: TodoItem = {
        ...current,
        ...patch,
        reminderStatus: resetTrigger ? "pending" : patch.reminderStatus ?? current.reminderStatus,
        id,
      };

      setWorkspace((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => (t.id === id ? updated : t)),
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
          const nextDone = !t.done;
          return {
            ...t,
            done: nextDone,
            reminderStatus: nextDone ? "dismissed" : t.reminder ? "pending" : undefined,
            date: getTodayDate(),
          };
        }),
      }));
    },
    [setWorkspace],
  );

  const remove = useCallback(
    (id: string) => {
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
          const nextWeekStart = addDays(weekEnd, 1);
          return {
            ...t,
            dueDate: nextWeekStart,
            reminderStatus: t.reminder ? ("pending" as ReminderStatus) : undefined,
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
            reminderStatus: t.reminder ? ("pending" as ReminderStatus) : undefined,
          };
        }),
      }));
    },
    [setWorkspace],
  );

  const { thisWeek, nextWeek } = useMemo(() => {
    const thisList: TodoItem[] = [];
    const nextList: TodoItem[] = [];

    todos.forEach((todo) => {
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

  useEffect(() => {
    let needsRollover = false;
    const currentToday = getTodayDate();

    const rolled = todos.map((todo) => {
      if (todo.done) return todo;
      const due = todo.dueDate ?? todo.date;
      if (due && due < weekStart) {
        needsRollover = true;
        return {
          ...todo,
          dueDate: currentToday,
          reminderStatus: todo.reminder ? ("pending" as ReminderStatus) : undefined,
        };
      }
      return todo;
    });

    if (needsRollover) {
      setWorkspace((prev) => ({
        ...prev,
        todos: rolled,
      }));
    }
  }, [todos, setWorkspace, weekStart]);

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