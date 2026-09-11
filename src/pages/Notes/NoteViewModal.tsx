import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import type { NoteItem } from "./notes.types";

interface NoteViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: NoteItem | null;
  onEdit: (note: NoteItem) => void;
}

export function NoteViewModal({ open, onOpenChange, note, onEdit }: NoteViewModalProps) {
  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader className="border-b border-border/50 pb-3">
          <DialogTitle className="text-base font-bold text-foreground">
            {note.title}
          </DialogTitle>
          <div className="text-[11px] text-muted-foreground">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </div>
        </DialogHeader>

        <div className="py-3 text-xs leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto text-foreground/90 font-sans">
          {note.content}
        </div>

        <div className="flex justify-end gap-2 border-t border-border/50 pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            Close
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onEdit(note);
            }}
            className="rounded-xl font-bold text-xs gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}