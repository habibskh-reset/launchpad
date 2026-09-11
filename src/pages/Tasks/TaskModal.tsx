import { useState, useEffect, type FormEvent } from "react";
import { Bell, Volume2, VolumeX, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getTodayDate } from "@/lib/date";
import { isNotificationSupported, requestNotificationPermission } from "@/services/notifications";
import type { TaskPriority, TodoItem } from "@/types/workspace";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TodoItem | null;
  onSave: (
    id: string,
    patch: {
      text: string;
      priority: TaskPriority;
      dueDate: string;
      dueTime?: string;
      reminder?: boolean;
      reminderOffset?: number;
      audioAlert?: boolean;
    }
  ) => void;
}

const PRIORITIES: { id: TaskPriority; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Med" },
  { id: "high", label: "High" },
];

export function TaskModal({ open, onOpenChange, task, onSave }: TaskModalProps) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState(getTodayDate());
  const [dueTime, setDueTime] = useState("");
  const [reminder, setReminder] = useState(false);
  const [reminderOffset, setReminderOffset] = useState(0);
  const [audioAlert, setAudioAlert] = useState(true);
  const [permStatus, setPermStatus] = useState<string>("granted");

  useEffect(() => {
    if (!open) return;
    if (task) {
      setText(task.text);
      setPriority(task.priority ?? "medium");
      setDueDate(task.dueDate ?? getTodayDate());
      setDueTime(task.dueTime ?? "09:00");
      setReminder(Boolean(task.reminder));
      setReminderOffset(task.reminderOffset ?? 0);
      setAudioAlert(task.audioAlert !== false);
    } else {
      setText("");
      setPriority("medium");
      setDueDate(getTodayDate());
      setDueTime("09:00");
      setReminder(false);
      setReminderOffset(0);
      setAudioAlert(true);
    }

    if (isNotificationSupported()) {
      setPermStatus(Notification.permission);
    }
  }, [open, task]);

  const handleReminderToggle = async (checked: boolean) => {
    setReminder(checked);
    if (checked && isNotificationSupported() && Notification.permission !== "granted") {
      const res = await requestNotificationPermission();
      setPermStatus(res);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!task || !text.trim()) return;
    onSave(task.id, {
      text: text.trim(),
      priority,
      dueDate,
      dueTime: reminder ? dueTime || "09:00" : undefined,
      reminder,
      reminderOffset: reminder ? reminderOffset : 0,
      audioAlert,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Edit Task & Reminder</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
          <div>
            <Label htmlFor="taskTitle">Task Description *</Label>
            <Input
              id="taskTitle"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Task details..."
              className="mt-1 text-sm h-9"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="taskDue">Due Date</Label>
              <input
                id="taskDue"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full h-9 px-2.5 rounded-md bg-background border border-input text-xs outline-none"
              />
            </div>
            <div>
              <Label htmlFor="taskPri">Priority</Label>
              <select
                id="taskPri"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="mt-1 w-full h-9 px-2 rounded-md bg-background border border-input text-xs outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-border/80 rounded-xl p-3 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="taskRemind"
                  checked={reminder}
                  onCheckedChange={(c) => handleReminderToggle(Boolean(c))}
                />
                <Label htmlFor="taskRemind" className="cursor-pointer font-semibold flex items-center gap-1.5 text-foreground">
                  <Bell className="h-3.5 w-3.5 text-primary" /> Enable Reminder
                </Label>
              </div>

              {reminder && (
                <button
                  type="button"
                  onClick={() => setAudioAlert((v) => !v)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Toggle Audio Chime"
                >
                  {audioAlert ? <Volume2 className="h-3.5 w-3.5 text-emerald-500" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span>{audioAlert ? "Sound On" : "Muted"}</span>
                </button>
              )}
            </div>

            {reminder && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <Label htmlFor="taskTime">Due Time</Label>
                  <input
                    id="taskTime"
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="mt-1 w-full h-9 px-2 rounded-md bg-background border border-input text-xs outline-none"
                  />
                </div>
                <div>
                  <Label htmlFor="taskOffset">Alert Offset</Label>
                  <select
                    id="taskOffset"
                    value={reminderOffset}
                    onChange={(e) => setReminderOffset(Number(e.target.value))}
                    className="mt-1 w-full h-9 px-2 rounded-md bg-background border border-input text-xs outline-none"
                  >
                    <option value={0}>At time of event</option>
                    <option value={5}>5 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                  </select>
                </div>
              </div>
            )}

            {reminder && permStatus === "denied" && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[11px]">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Browser notifications are blocked. Unblock notifications in browser settings for alert popups.</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}