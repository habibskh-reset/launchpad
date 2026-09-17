import { useState, type FormEvent, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Sparkles, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteItem } from "./notes.types";

interface NoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: NoteItem | null;
  onSave: (payload: { title: string; content: string; color: NoteItem["color"] }) => void;
}

const COLORS: { id: NonNullable<NoteItem["color"]>; label: string; ring: string; dot: string }[] = [
  { id: "default", label: "Default", ring: "ring-zinc-400", dot: "bg-zinc-700 dark:bg-zinc-300" },
  { id: "amber", label: "Amber", ring: "ring-amber-500", dot: "bg-amber-500" },
  { id: "emerald", label: "Emerald", ring: "ring-emerald-500", dot: "bg-emerald-500" },
  { id: "violet", label: "Violet", ring: "ring-violet-500", dot: "bg-violet-500" },
  { id: "rose", label: "Rose", ring: "ring-rose-500", dot: "bg-rose-500" },
  { id: "blue", label: "Blue", ring: "ring-blue-500", dot: "bg-blue-500" },
];

export function NoteModal({ open, onOpenChange, note, onSave }: NoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<NoteItem["color"]>("default");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    onSave({ 
      title: title.trim() || "Untitled Note", 
      content: content.trim(), 
      color 
    });
    onOpenChange(false);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden border border-border/70 bg-card/95 backdrop-blur-2xl shadow-2xl rounded-2xl">
        {/* Header Ribbon */}
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <DialogHeader className="p-0 m-0">
            <DialogTitle className="text-sm font-semibold flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-foreground">
                  {note ? "Edit Note" : "Create New Note"}
                </span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Capture thoughts, prompt templates, or long-form scratchpads
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-6 space-y-4">
          {/* Note Title Input */}
          <div className="relative">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title or Topic Headline..."
              className="h-12 text-base font-semibold px-4 rounded-xl bg-background/60 border-border/80 focus-visible:ring-primary/40 focus-visible:border-primary transition-all placeholder:text-muted-foreground/60 shadow-inner"
              autoFocus
            />
          </div>

          {/* Large Expansive Textarea */}
          <div className="relative group">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start drafting here... supports raw Markdown, prompt formulas, or long notes."
              rows={14}
              className="w-full rounded-xl border border-border/80 bg-background/50 p-4 text-sm font-mono leading-relaxed text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-inner resize-y min-h-[260px] max-h-[60vh]"
            />
          </div>

          {/* Bottom Controls: Counter, Palette & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/50">
            {/* Color Palette Picker */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Accent:
              </span>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/50">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.label}
                    onClick={() => setColor(c.id)}
                    className={cn(
                      "w-6 h-6 rounded-lg transition-all flex items-center justify-center cursor-pointer",
                      color === c.id 
                        ? `ring-2 ring-offset-2 ring-offset-background ${c.ring} scale-110 shadow-md` 
                        : "opacity-70 hover:opacity-100 hover:scale-105"
                    )}
                  >
                    <span className={cn("w-3.5 h-3.5 rounded-full shadow-sm", c.dot)} />
                  </button>
                ))}
              </div>
            </div>

            {/* Word count & Actions */}
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-[11px] font-medium text-muted-foreground/70 select-none hidden sm:inline">
                {wordCount} {wordCount === 1 ? "word" : "words"} • {charCount} chars
              </span>

              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl text-xs h-9 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!title.trim() && !content.trim()}
                  className="rounded-xl font-bold text-xs h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-primary/30 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  {note ? "Update Note" : "Save Note"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}