import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTodayDate } from "@/lib/date";
import type { TaskPriority, TodoItem } from "@/types/workspace";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TodoItem | null;
  onSave: (id: string, patch: { text: string; priority: TaskPriority; dueDate: string }) => void;
}

const PRIORITIES: { id: TaskPriority; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Med" },
  { id: "high", label: "High" },
];

export function TaskModal({ open, onOpenChange, task, onSave }: TaskModalProps) {
  const [text, setText] = useState(task?.text ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? getTodayDate());

  useState(() => {
    if (task) {
      setText(task.text);
      setPriority(task.priority ?? "medium");
      setDueDate(task.dueDate ?? getTodayDate());
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!task || !text.trim()) return;
    onSave(task.id, { text: text.trim(), priority, dueDate });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Task description..."
              className="text-sm"
              autoFocus
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-9 px-2 rounded-md bg-background border border-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-9 px-2 rounded-md bg-background border border-input text-xs"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
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