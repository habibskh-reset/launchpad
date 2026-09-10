import { useState, type FormEvent, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useUIStore } from "@/stores/uiStore";
import { createId } from "@/lib/id";
import type { LinkItem } from "@/types/workspace";

export function LinkModal() {
  const { linkModalOpen, editingLinkId, preferredFolderId, closeLinkModal } = useUIStore();
  const columns = useWorkspaceStore((s) => s.workspace.columns);
  const links = useWorkspaceStore((s) => s.workspace.links);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  const existing = editingLinkId ? links.find((l) => l.id === editingLinkId) : undefined;

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [columnId, setColumnId] = useState("");
  const [description, setDescription] = useState("");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!linkModalOpen) return;
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
      setColumnId(preferredFolderId ?? columns[0]?.id ?? "");
    }
  }, [linkModalOpen, existing, preferredFolderId, columns]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!columnId || !url.trim() || !title.trim()) return;

    if (editingLinkId) {
      setWorkspace((prev) => ({
        ...prev,
        links: prev.links.map((l) =>
          l.id === editingLinkId
            ? {
                ...l,
                title: title.trim(),
                url: url.trim(),
                columnId,
                description: description.trim() || undefined,
                pinned,
              }
            : l,
        ),
      }));
    } else {
      const newLink: LinkItem = {
        id: createId("link"),
        title: title.trim(),
        url: url.trim(),
        columnId,
        description: description.trim() || undefined,
        pinned,
      };
      setWorkspace((prev) => ({ ...prev, links: [...prev.links, newLink] }));
    }

    closeLinkModal();
  };

  return (
    <Dialog open={linkModalOpen} onOpenChange={(open) => !open && closeLinkModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {editingLinkId ? "Edit Bookmark" : "Add Bookmark"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <Label htmlFor="linkTitle">Website Title *</Label>
            <Input
              id="linkTitle"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Google Drive, ChatGPT"
              className="mt-1 text-sm h-9"
            />
          </div>
          <div>
            <Label htmlFor="linkUrl">URL Link *</Label>
            <Input
              id="linkUrl"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 text-sm h-9"
            />
          </div>
          <div>
            <Label htmlFor="linkFolder">Folder *</Label>
            <select
              id="linkFolder"
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              className="mt-1 w-full h-9 px-3 rounded-md bg-background border border-input text-xs outline-none"
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="linkDesc">Description (Optional)</Label>
            <Input
              id="linkDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quick note"
              className="mt-1 text-sm h-9"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="linkPinned"
              checked={pinned}
              onCheckedChange={(v) => setPinned(Boolean(v))}
            />
            <Label htmlFor="linkPinned" className="text-xs cursor-pointer">
              Pin to top
            </Label>
          </div>
          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={closeLinkModal}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              {editingLinkId ? "Save Changes" : "Save Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}