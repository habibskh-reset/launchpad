import { useState, useMemo, type MouseEvent } from "react";
import { ChevronDown, FolderOpen, Pencil, Pin, Plus, Trash2 } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useUIStore } from "@/stores/uiStore";
import { useConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { FolderModal } from "./FolderModal";
import { LinkModal } from "./LinkModal";
import { tryGetDomain } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Folder, FolderColor, LinkItem } from "@/types/workspace";

const FALLBACK_FAVICON = "https://cdn-icons-png.flaticon.com/512/1006/1006771.png";

const COLOR_ACCENTS: Record<FolderColor, string> = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
  blue: "bg-blue-500",
};

export function LaunchpadPage({ searchTerm = "" }: { searchTerm?: string }) {
  const columns = useWorkspaceStore((s) => s.workspace.columns);
  const links = useWorkspaceStore((s) => s.workspace.links);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  const { openAddLink, openEditLink, openAddFolder, openEditFolder } = useUIStore();
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const { confirm, ConfirmDialogElement } = useConfirmDialog();

  const searchLower = searchTerm.toLowerCase().trim();

  const sortLinks = (items: LinkItem[]) =>
    [...items].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const filteredColumns = useMemo(() => {
    if (!searchLower) {
      return columns.map((col) => ({
        col,
        links: sortLinks(links.filter((l) => l.columnId === col.id)),
      }));
    }
    return columns
      .map((col) => {
        const colLinks = links.filter((l) => l.columnId === col.id);
        const matchesFolder = col.title.toLowerCase().includes(searchLower);
        const matchedLinks = colLinks.filter(
          (l) =>
            l.title?.toLowerCase().includes(searchLower) ||
            l.url?.toLowerCase().includes(searchLower) ||
            l.description?.toLowerCase().includes(searchLower),
        );
        if (matchesFolder || matchedLinks.length) {
          return { col, links: sortLinks(matchesFolder ? colLinks : matchedLinks) };
        }
        return null;
      })
      .filter(Boolean) as { col: Folder; links: LinkItem[] }[];
  }, [columns, links, searchLower]);

  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteLink = async (id: string) => {
    const link = links.find((l) => l.id === id);
    if (!link) return;
    if (await confirm(`Delete "${link.title}"?`)) {
      setWorkspace((prev) => ({
        ...prev,
        links: prev.links.filter((l) => l.id !== id),
      }));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Resource Folders
        </h3>
        <Button size="sm" onClick={openAddFolder} className="rounded-xl font-bold text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" /> New Folder
        </Button>
      </div>

      {columns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center flex flex-col items-center gap-2">
          <FolderOpen className="h-8 w-8 text-muted-foreground/40 mb-1" />
          <div className="text-sm font-semibold">No folders yet</div>
          <p className="text-xs text-muted-foreground max-w-sm mb-2">
            Organize bookmarks and resources into clean, colored folders.
          </p>
          <Button size="sm" onClick={openAddFolder} className="rounded-xl">
            Create First Folder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredColumns.map(({ col, links: colLinks }) => {
            const isOpen = searchLower ? true : openFolders.has(col.id);
            const accent = COLOR_ACCENTS[col.color] ?? COLOR_ACCENTS.amber;

            return (
              <div
                key={col.id}
                className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex flex-col justify-start"
              >
                <span className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-full", accent)} aria-hidden />

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleFolder(col.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleFolder(col.id);
                    }
                  }}
                  className="w-full pl-4 pr-3 py-3 flex items-center justify-between hover:bg-muted/40 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs flex-shrink-0 text-foreground">
                      <i className={col.icon || "fa-solid fa-folder"} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{col.title}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {colLinks.length} {colLinks.length === 1 ? "link" : "links"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => openAddLink(col.id)}
                      className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Add link"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditFolder(col.id)}
                      className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit folder"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <span
                      className={cn(
                        "ml-1 w-4 h-4 flex items-center justify-center text-muted-foreground transition-transform duration-150",
                        isOpen && "rotate-180",
                      )}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-3 pb-3 pt-1 border-t border-border/60 bg-muted/10 flex-1">
                    {colLinks.length === 0 ? (
                      <div className="py-5 text-center text-xs text-muted-foreground">No links in this folder</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-1 pt-1">
                        {colLinks.map((link) => (
                          <LinkRowItem
                            key={link.id}
                            link={link}
                            onEdit={openEditLink}
                            onDelete={handleDeleteLink}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <LinkModal />
      <FolderModal />
      {ConfirmDialogElement}
    </div>
  );
}

function LinkRowItem({
  link,
  onEdit,
  onDelete,
}: {
  link: LinkItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const domain = tryGetDomain(link.url);
  const [favicon, setFavicon] = useState(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);

  const handleEdit = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(link.id);
  };

  const handleDelete = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(link.id);
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card px-2.5 py-1.5 transition-all"
    >
      <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
        <img
          src={favicon}
          onError={() => setFavicon(FALLBACK_FAVICON)}
          className="w-3.5 h-3.5 rounded-sm object-contain"
          alt=""
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-xs truncate">{link.title}</span>
          {link.pinned && <Pin className="h-2.5 w-2.5 text-primary flex-shrink-0" fill="currentColor" />}
        </div>
        <div className="text-[10px] text-muted-foreground truncate">{link.description || domain}</div>
      </div>
      <div
        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={handleEdit} className="p-1 text-muted-foreground hover:text-foreground">
          <Pencil className="h-3 w-3" />
        </button>
        <button type="button" onClick={handleDelete} className="p-1 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </a>
  );
}