import { playReminderChime } from "@/lib/audio";
import type { TodoItem } from "@/types/workspace";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!isNotificationSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export async function dispatchTaskNotification(task: TodoItem): Promise<void> {
  if (task.audioAlert !== false) {
    playReminderChime();
  }

  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return;
  }

  const title = `Task Reminder: ${task.text}`;
  const options: NotificationOptions = {
    body: task.dueTime
      ? `Scheduled for ${task.dueTime} (Offset: ${task.reminderOffset || 0}m)`
      : "Your scheduled task deadline is now.",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: `task-reminder-${task.id}`,
  };

  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
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
}