import { useState, useMemo } from "react";
import { Edit3, FileText, Pin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotes } from "./useNotes";
import { NoteModal } from "./NoteModal";
import { cn } from "@/lib/utils";
import type { NoteItem } from "./notes.types";

const NOTE_COLORS: Record<string, { bg: string; border: string }> = {
  default: { bg: "bg-card/80", border: "border-border" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/30" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/30" },
  rose: { bg: "bg-rose-500/10", border: "border-rose-500/30" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

export function NotesPage({ searchTerm = "" }: { searchTerm?: string }) {
  const { notes, addNote, updateNote, togglePin, removeNote } = useNotes();
  const { confirm, ConfirmDialogElement } = useConfirmDialog();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

  const filteredNotes = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return notes;
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
    );
  }, [notes, searchTerm]);

  const handleOpenAdd = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (note: NoteItem) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleDelete = async (note: NoteItem) => {
    if (await confirm(`Delete note "${note.title}"?`)) {
      removeNote(note.id);
    }
  };

  const handleSave = (payload: { title: string; content: string; color: NoteItem["color"] }) => {
    if (editingNote) {
      updateNote(editingNote.id, payload);
    } else {
      addNote(payload);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-foreground">Scratchpad & Notes</h2>
            <p className="text-[11px] text-muted-foreground">
              {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"} recorded
            </p>
          </div>
        </div>

        <Button size="sm" onClick={handleOpenAdd} className="rounded-xl font-bold text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" /> New Note
        </Button>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center flex flex-col items-center gap-2">
          <FileText className="h-8 w-8 text-muted-foreground/40 mb-1" />
          <div className="text-sm font-semibold">No notes found</div>
          <p className="text-xs text-muted-foreground max-w-sm">
            {searchTerm ? "No notes match your search query." : "Capture ideas or scratchpad notes anytime."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredNotes.map((note) => {
            const color = NOTE_COLORS[note.color ?? "default"] ?? NOTE_COLORS.default;

            return (
              <div
                key={note.id}
                className={cn(
                  "group relative rounded-2xl border p-4 flex flex-col justify-between transition-all shadow-sm",
                  color.bg,
                  color.border,
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">
                      {note.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => togglePin(note.id)}
                      className={cn(
                        "p-1 rounded-lg transition-colors flex-shrink-0",
                        note.pinned ? "text-primary hover:text-primary/80" : "text-muted-foreground/50 hover:text-foreground",
                      )}
                      title={note.pinned ? "Unpin note" : "Pin note"}
                    >
                      <Pin className="h-3.5 w-3.5" fill={note.pinned ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-6">
                    {note.content}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border/50 mt-4 text-[10px] text-muted-foreground">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(note)}
                      className="p-1 rounded hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(note)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NoteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        note={editingNote}
        onSave={handleSave}
      />
      {ConfirmDialogElement}
    </div>
  );
}