import { useEffect, useState, type FormEvent } from "react";
import { FolderCog, FolderPlus, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useWorkspaceActions } from "../hooks/useWorkspaceActions";
import { useConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { Folder as FolderT, FolderColor, FolderStyle } from "@/types/workspace";

interface AddFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  onRequestEditReset: () => void;
  onCreated?: (id: string) => void;
}

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

const COLOR_OPTIONS: { value: FolderColor; label: string }[] = [
  { value: "amber", label: "Amber" },
  { value: "emerald", label: "Green" },
  { value: "violet", label: "Violet" },
  { value: "rose", label: "Rose" },
  { value: "cyan", label: "Cyan" },
  { value: "blue", label: "Blue" },
];

const STYLE_OPTIONS: { value: FolderStyle; label: string }[] = [
  { value: "filled", label: "Filled" },
  { value: "outline", label: "Outline" },
];

const SELECT_CLASS =
  "mt-1.5 w-full h-9 px-3 rounded-md bg-background border border-input text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AddFolderModal({
  open,
  onOpenChange,
  editingId,
  onRequestEditReset,
  onCreated,
}: AddFolderModalProps) {
  const columns = useWorkspaceStore((s) => s.workspace.columns);
  const { addFolder, updateFolder, removeFolder } = useWorkspaceActions();
  const { confirm, ConfirmDialogElement } = useConfirmDialog();

  const existing: FolderT | undefined = editingId
    ? columns.find((c) => c.id === editingId)
    : undefined;

  const [title, setTitle] = useState("");
  const [color, setColor] = useState<FolderColor>("amber");
  const [style, setStyle] = useState<FolderStyle>("filled");
  const [icon, setIcon] = useState("fa-solid fa-folder");

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setTitle(existing.title);
      setColor(existing.color);
      setStyle(existing.style);
      setIcon(existing.icon);
    } else {
      setTitle("");
      setColor("amber");
      setStyle("filled");
      setIcon("fa-solid fa-folder");
    }
  }, [open, existing]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const payload = {
      title: trimmed,
      color,
      style,
      icon: icon.trim() || "fa-solid fa-folder",
    };
    if (editingId) {
      updateFolder(editingId, payload);
    } else {
      const id = addFolder(payload);
      onCreated?.(id);
    }
    onOpenChange(false);
    onRequestEditReset();
  };

  const handleDelete = async () => {
    if (!editingId) return;
    const folder = columns.find((c) => c.id === editingId);
    if (!folder) return;
    const ok = await confirm(
      `Delete folder "${folder.title}" and all its links?`,
    );
    if (ok) {
      removeFolder(editingId);
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
                <FolderCog className="h-4 w-4 text-muted-foreground" /> Edit Folder
              </>
            ) : (
              <>
                <FolderPlus className="h-4 w-4 text-muted-foreground" /> New Folder
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="folderTitle">Folder Title *</Label>
            <Input
              id="folderTitle"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Work Tools, Socials, Dev"
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="folderColor">Color Theme</Label>
              <select
                id="folderColor"
                value={color}
                onChange={(e) => setColor(e.target.value as FolderColor)}
                 className={SELECT_CLASS}
              >
                {COLOR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="folderStyle">Background Style</Label>
              <select
                id="folderStyle"
                value={style}
                onChange={(e) => setStyle(e.target.value as FolderStyle)}
                 className={SELECT_CLASS}
              >
                {STYLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label className="block mb-1.5">Choose Icon</Label>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-md bg-muted border border-border flex items-center justify-center text-foreground text-sm flex-shrink-0">
                <i className={icon || "fa-solid fa-folder"} />
              </div>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="fa-solid fa-folder"
                className="text-xs"
              />
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 pt-1">
              {PRESET_ICONS.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setIcon(cls)}
                  className={cnPreset(
                    icon === cls,
                    "p-2 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground transition-colors duration-150 text-muted-foreground",
                  )}
                >
                  <i className={cls} />
                </button>
              ))}
            </div>
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
                    <Plus className="h-3.5 w-3.5" /> Save Folder
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

function cnPreset(active: boolean, base: string) {
  return active ? `${base} bg-primary text-primary-foreground` : base;
}
