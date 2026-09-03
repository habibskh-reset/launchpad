import { useEffect, useState, type FormEvent } from "react";
import { Bookmark, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useWorkspaceActions } from "../hooks/useWorkspaceActions";
import { useConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { LinkItem } from "@/types/workspace";

interface AddLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  preferredColumnId: string | null;
  onRequestEditReset: () => void;
}

export function AddLinkModal({
  open,
  onOpenChange,
  editingId,
  preferredColumnId,
  onRequestEditReset,
}: AddLinkModalProps) {
  const columns = useWorkspaceStore((s) => s.workspace.columns);
  const links = useWorkspaceStore((s) => s.workspace.links);
  const { addLink, updateLink, removeLink } = useWorkspaceActions();
  const { confirm, ConfirmDialogElement } = useConfirmDialog();

  const existing: LinkItem | undefined = editingId
    ? links.find((l) => l.id === editingId)
    : undefined;

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [columnId, setColumnId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setTitle(existing.title);
      setUrl(existing.url);
      setColumnId(existing.columnId);
      setDescription(existing.description ?? "");
      setPinned(Boolean(existing.pinned));
    } else {
      setTitle("");
      setUrl("");
      setDescription("");
      setPinned(false);
      const fallback =
        preferredColumnId ?? columns[0]?.id ?? "";
      setColumnId(fallback);
    }
  }, [open, existing, preferredColumnId, columns]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!columnId) return;
    const payload = {
      title: title.trim(),
      url: url.trim(),
      columnId,
      description: description.trim() || undefined,
      pinned,
    };
    if (editingId) {
      updateLink(editingId, payload);
    } else {
      addLink(payload);
    }
    onOpenChange(false);
    onRequestEditReset();
  };

  const handleDelete = async () => {
    if (!editingId) return;
    const link = links.find((l) => l.id === editingId);
    if (!link) return;
    const ok = await confirm(`Delete "${link.title}"?`);
    if (ok) {
      removeLink(editingId);
      onOpenChange(false);
      onRequestEditReset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingId ? (
              <>
                <Pencil className="h-4 w-4 text-muted-foreground" /> Edit Link
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4 text-muted-foreground" /> Add Link
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="linkTitle">Website Title *</Label>
            <Input
              id="linkTitle"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ChatGPT, Studio, Notion"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="linkUrl">URL / Web Link *</Label>
            <Input
              id="linkUrl"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://chatgpt.com"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="linkFolder">Folder</Label>
            <select
              id="linkFolder"
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              className="mt-1.5 w-full h-9 px-3 rounded-md bg-background border border-input text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="linkDesc">Description (Optional)</Label>
            <Input
              id="linkDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief reminder or note"
              className="mt-1.5"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="linkPinned"
              checked={pinned}
              onCheckedChange={(v) => setPinned(Boolean(v))}
            />
            <Label
              htmlFor="linkPinned"
              className="font-medium cursor-pointer mb-0"
            >
              Pin to top of folder
            </Label>
          </div>
          <div className="pt-3 flex items-center justify-between gap-2 border-t border-border">
            {editingId ? (
              <Button
                type="button"
                variant="subtle"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? (
                  "Save Changes"
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" /> Save Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
        {ConfirmDialogElement}
      </DialogContent>
    </Dialog>
  );
}
