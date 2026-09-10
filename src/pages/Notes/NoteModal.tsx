import { useState, type FormEvent, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { NoteItem } from "./notes.types";

interface NoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: NoteItem | null;
  onSave: (payload: { title: string; content: string; color: NoteItem["color"] }) => void;
}

const COLORS: { id: NonNullable<NoteItem["color"]>; class: string }[] = [
  { id: "default", class: "bg-card border-border" },
  { id: "amber", class: "bg-amber-500/20 border-amber-500/40" },
  { id: "emerald", class: "bg-emerald-500/20 border-emerald-500/40" },
  { id: "violet", class: "bg-violet-500/20 border-violet-500/40" },
  { id: "rose", class: "bg-rose-500/20 border-rose-500/40" },
  { id: "blue", class: "bg-blue-500/20 border-blue-500/40" },
];

export function NoteModal({ open, onOpenChange, note, onSave }: NoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<NoteItem["color"]>("default");

  useEffect(() => {
    if (!open) return;
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color ?? "default");
    } else {
      setTitle("");
      setContent("");
      setColor("default");
    }
  }, [open, note]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    onSave({ title: title.trim() || "Untitled Note", content: content.trim(), color });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {note ? "Edit Note" : "New Note"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="text-sm font-semibold"
            autoFocus
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write notes, thoughts, or checklists..."
            rows={5}
            className="w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Color:</span>
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className={cn(
                  "w-5 h-5 rounded-full border transition-all",
                  c.class,
                  color === c.id ? "ring-2 ring-primary scale-110" : "",
                )}
              />
            ))}
          </div>
          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              {note ? "Save Changes" : "Create Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}