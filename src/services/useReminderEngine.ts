import { useEffect, useRef } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { dispatchTaskNotification } from "@/services/notifications";

export function useReminderEngine() {
  const todos = useWorkspaceStore((s) => s.workspace.todos);
  const setTodos = useWorkspaceStore((s) => s.setTodos);
  const activeIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();

      todos.forEach((task) => {
        if (!task.reminder || task.done || task.reminderStatus === "dismissed") {
          return;
        }

        if (!task.dueDate) return;

        const timeStr = task.dueTime || "09:00";
        const targetDate = new Date(`${task.dueDate}T${timeStr}:00`);
        const targetTimestamp = targetDate.getTime();
        if (Number.isNaN(targetTimestamp)) return;

        const offsetMs = (task.reminderOffset || 0) * 60 * 1000;
        const triggerTime = targetTimestamp - offsetMs;
        const diff = triggerTime - now;

        // Fire if due within the current 15s window or overdue by less than 5 minutes
        if (
          diff <= 15000 &&
          diff > -300000 &&
          !activeIdsRef.current.has(task.id) &&
          task.reminderStatus !== "triggered"
        ) {
          activeIdsRef.current.add(task.id);
          void dispatchTaskNotification(task);

          setTodos((prevList) =>
            prevList.map((t) =>
              t.id === task.id ? { ...t, reminderStatus: "triggered" } : t
            )
          );
        }
      });
    };

    checkReminders();
    const interval = window.setInterval(checkReminders, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [todos, setTodos]);
}