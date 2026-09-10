import { useState, type FormEvent, useEffect } from "react";
import { FolderCog, FolderPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useUIStore } from "@/stores/uiStore";
import { createId } from "@/lib/id";
import { cn } from "@/lib/utils";
import type { Folder, FolderColor, FolderStyle } from "@/types/workspace";

const PRESET_ICONS = [
  "fa-solid fa-folder",
  "fa-solid fa-star",
  "fa-solid fa-fire",
  "fa-solid fa-bolt",
  "fa-solid fa-wand-magic-sparkles",
  "fa-solid fa-comments",
  "fa-solid fa-code",
  "fa-solid fa-rocket",
  "fa-solid fa-dumbbell",
  "fa-solid fa-briefcase",
  "fa-solid fa-globe",
  "fa-solid fa-chart-line",
];

export function FolderModal() {
  const { folderModalOpen, editingFolderId, closeFolderModal } = useUIStore();
  const columns = useWorkspaceStore((s) => s.workspace.columns);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  const existing = editingFolderId ? columns.find((c) => c.id === editingFolderId) : undefined;

  const [title, setTitle] = useState("");
  const [color, setColor] = useState<FolderColor>("amber");
  const [icon, setIcon] = useState("fa-solid fa-folder");

  useEffect(() => {
    if (!folderModalOpen) return;
    if (existing) {
      setTitle(existing.title);
      setColor(existing.color);
      setIcon(existing.icon);
    } else {
      setTitle("");
      setColor("amber");
      setIcon("fa-solid fa-folder");
    }
  }, [folderModalOpen, existing]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    if (editingFolderId) {
      setWorkspace((prev) => ({
        ...prev,
        columns: prev.columns.map((c) =>
          c.id === editingFolderId ? { ...c, title: trimmed, color, icon } : c,
        ),
      }));
    } else {
      const newFolder: Folder = {
        id: createId("folder"),
        title: trimmed,
        color,
        style: "filled" as FolderStyle,
        icon,
      };
      setWorkspace((prev) => ({ ...prev, columns: [...prev.columns, newFolder] }));
    }

    closeFolderModal();
  };

  return (
    <Dialog open={folderModalOpen} onOpenChange={(open) => !open && closeFolderModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            {editingFolderId ? <FolderCog className="h-4 w-4" /> : <FolderPlus className="h-4 w-4" />}
            <span>{editingFolderId ? "Edit Folder" : "New Folder"}</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <Label htmlFor="folderTitle">Folder Name *</Label>
            <Input
              id="folderTitle"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Work, Tools, Dev"
              className="mt-1 text-sm h-9"
            />
          </div>
          <div>
            <Label htmlFor="folderColor">Color Theme</Label>
            <select
              id="folderColor"
              value={color}
              onChange={(e) => setColor(e.target.value as FolderColor)}
              className="mt-1 w-full h-9 px-3 rounded-md bg-background border border-input text-xs outline-none"
            >
              <option value="amber">Amber</option>
              <option value="emerald">Green</option>
              <option value="violet">Violet</option>
              <option value="rose">Rose</option>
              <option value="cyan">Cyan</option>
              <option value="blue">Blue</option>
            </select>
          </div>
          <div>
            <Label className="block mb-1">Select Icon</Label>
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {PRESET_ICONS.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setIcon(cls)}
                  className={cn(
                    "p-2 rounded-lg bg-muted text-center transition-colors text-xs",
                    icon === cls ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted/80",
                  )}
                >
                  <i className={cls} />
                </button>
              ))}
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={closeFolderModal}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              {editingFolderId ? "Save Changes" : "Create Folder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}