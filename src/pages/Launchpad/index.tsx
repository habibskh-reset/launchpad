import { useState, useMemo, type MouseEvent } from "react";
import { ChevronDown, FolderOpen, Pencil, Pin, Plus, Trash2, ExternalLink, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const COLOR_MAP: Record<FolderColor, { strip: string; glow: string; badge: string; iconBg: string }> = {
  amber: {
    strip: "bg-amber-500",
    glow: "hover:border-amber-500/40 border-amber-500/25",
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    iconBg: "bg-amber-500/15 text-amber-500",
  },
  emerald: {
    strip: "bg-emerald-500",
    glow: "hover:border-emerald-500/40 border-emerald-500/25",
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    iconBg: "bg-emerald-500/15 text-emerald-500",
  },
  violet: {
    strip: "bg-violet-500",
    glow: "hover:border-violet-500/40 border-violet-500/25",
    badge: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    iconBg: "bg-violet-500/15 text-violet-500",
  },
  rose: {
    strip: "bg-rose-500",
    glow: "hover:border-rose-500/40 border-rose-500/25",
    badge: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    iconBg: "bg-rose-500/15 text-rose-500",
  },
  cyan: {
    strip: "bg-cyan-500",
    glow: "hover:border-cyan-500/40 border-cyan-500/25",
    badge: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    iconBg: "bg-cyan-500/15 text-cyan-500",
  },
  blue: {
    strip: "bg-blue-500",
    glow: "hover:border-blue-500/40 border-blue-500/25",
    badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    iconBg: "bg-blue-500/15 text-blue-500",
  },
};

export function LaunchpadPage({ searchTerm = "" }: { searchTerm?: string }) {
  const columns = useWorkspaceStore((s) => s.workspace.columns);
  const links = useWorkspaceStore((s) => s.workspace.links);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  const { openAddLink, openEditLink, openAddFolder, openEditFolder } = useUIStore();
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
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
    setOpenFolderId((prev) => (prev === id ? null : id));
  };

  const handleDeleteLink = async (id: string) => {
    const link = links.find((l) => l.id === id);
    if (!link) return;
    if (await confirm(`Delete bookmark "${link.title}"?`)) {
      setWorkspace((prev) => ({
        ...prev,
        links: prev.links.filter((l) => l.id !== id),
      }));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Resource Directory ({columns.length})
          </h3>
        </div>
        <Button 
          size="sm" 
          onClick={openAddFolder} 
          className="rounded-xl font-bold text-xs h-8 px-3.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> New Folder
        </Button>
      </div>

      {columns.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 backdrop-blur-xl p-16 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground/50 mb-1">
            <FolderOpen className="h-7 w-7" />
          </div>
          <div className="text-base font-bold text-foreground">Workspace Empty</div>
          <p className="text-xs text-muted-foreground max-w-sm">
            Categorize bookmarks, tools, dev consoles, and production links into clean cards.
          </p>
          <Button size="sm" onClick={openAddFolder} className="rounded-xl font-bold text-xs mt-2 cursor-pointer">
            Create First Folder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 items-start">
          {filteredColumns.map(({ col, links: colLinks }) => {
            const isOpen = searchLower ? true : openFolderId === col.id;
            const theme = COLOR_MAP[col.color] ?? COLOR_MAP.amber;

            return (
              <motion.div
                key={col.id}
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "group relative rounded-2xl border bg-card/85 backdrop-blur-xl overflow-hidden card-hardware transition-colors duration-200",
                  isOpen ? theme.glow + " shadow-xl" : "border-border/60 hover:border-border/90 shadow-sm"
                )}
              >
                {/* Accent Color Strip */}
                <span
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5 transition-opacity duration-200",
                    theme.strip,
                    isOpen ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                  )}
                  aria-hidden
                />

                {/* Folder Header Trigger */}
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
                  className="w-full pl-4 pr-3.5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 transition-transform duration-200",
                      isOpen ? "scale-105 shadow-sm " + theme.iconBg : "bg-muted text-foreground"
                    )}>
                      <i className={col.icon || "fa-solid fa-folder"} />
                    </div>
                    
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {col.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", theme.badge)}>
                          {colLinks.length} {colLinks.length === 1 ? "link" : "links"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => openAddLink(col.id)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-95"
                      title="Add link"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditFolder(col.id)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-95"
                      title="Edit folder"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </div>
                </div>

                {/* Animated Drawer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="border-t border-border/50 bg-muted/20 overflow-hidden"
                    >
                      <div className="px-3 pb-3 pt-2">
                        {colLinks.length === 0 ? (
                          <div className="py-6 text-center text-xs text-muted-foreground/70 flex flex-col items-center justify-center gap-1">
                            <Sparkles className="h-4 w-4 opacity-40 mb-1 text-primary" />
                            <span>No links inside</span>
                            <button
                              type="button"
                              onClick={() => openAddLink(col.id)}
                              className="text-[11px] font-bold text-primary hover:underline mt-1 cursor-pointer"
                            >
                              + Add first bookmark
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-1">
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
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
      className="group/item flex items-center justify-between gap-3 rounded-xl border border-transparent hover:border-border/80 hover:bg-card p-2 transition-all duration-150 shadow-none hover:shadow-md cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-6 h-6 rounded-lg bg-background border border-border/60 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-0.5">
          <img
            src={favicon}
            onError={() => setFavicon(FALLBACK_FAVICON)}
            className="w-4 h-4 rounded-sm object-contain"
            alt=""
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-foreground group-hover/item:text-primary transition-colors truncate">
              {link.title}
            </span>
            {link.pinned && (
              <Pin className="h-2.5 w-2.5 text-primary fill-primary flex-shrink-0" />
            )}
          </div>
          <div className="text-[10px] text-muted-foreground/70 truncate font-mono">
            {link.description || domain}
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleEdit}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="Edit link"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          title="Delete link"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </a>
  );
}