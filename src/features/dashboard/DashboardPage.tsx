import { useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useDashboardUI } from "@/stores/dashboardUIStore";
import { SearchBar } from "@/components/layout/SearchBar";
import { TodoSection } from "@/features/todos/TodoSection";
import { FolderAccordion } from "./components/FolderAccordion";
import { AddLinkModal } from "./components/AddLinkModal";
import { AddFolderModal } from "./components/AddFolderModal";
import { useConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useWorkspaceActions } from "./hooks/useWorkspaceActions";
import { Button } from "@/components/ui/button";
import { useCan } from "@/features/auth/useCan";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/types/workspace";

export function DashboardPage() {
  const columns = useWorkspaceStore((s) => s.workspace.columns);
  const links = useWorkspaceStore((s) => s.workspace.links);
  const { removeLink } = useWorkspaceActions();
  const { confirm, ConfirmDialogElement } = useConfirmDialog();
  const canCreateFolder = useCan("folders.create");

  const activeTab = useDashboardUI((s) => s.activeTab);
  const linkModalOpen = useDashboardUI((s) => s.linkModalOpen);
  const folderModalOpen = useDashboardUI((s) => s.folderModalOpen);
  const editingLinkId = useDashboardUI((s) => s.editingLinkId);
  const editingFolderId = useDashboardUI((s) => s.editingFolderId);
  const preferredColumnId = useDashboardUI((s) => s.preferredColumnId);
  const closeLinkModal = useDashboardUI((s) => s.closeLinkModal);
  const closeFolderModal = useDashboardUI((s) => s.closeFolderModal);
  const openEditLinkModal = useDashboardUI((s) => s.openEditLinkModal);
  const openEditFolderModal = useDashboardUI((s) => s.openEditFolderModal);

  const [search, setSearch] = useState("");
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  const searchLower = search.toLowerCase().trim();

  // Helper to float pinned bookmarks to the top
  const sortLinks = (items: LinkItem[]) =>
    [...items].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const filteredColumns = useMemo(() => {
    if (!searchLower) {
      return columns.map((col, i) => ({
        col,
        links: sortLinks(links.filter((l) => l.columnId === col.id)),
        idx: i,
      }));
    }
    return columns
      .map((col, i) => {
        const colLinks = links.filter((l) => l.columnId === col.id);
        const matchesTitle = col.title.toLowerCase().includes(searchLower);
        const matched = colLinks.filter(
          (l) =>
            l.title?.toLowerCase().includes(searchLower) ||
            l.url?.toLowerCase().includes(searchLower) ||
            l.description?.toLowerCase().includes(searchLower),
        );
        if (matchesTitle || matched.length) {
          return {
            col,
            links: sortLinks(matchesTitle ? colLinks : matched),
            idx: i,
          };
        }
        return null;
      })
      .filter(Boolean) as {
      col: (typeof columns)[0];
      links: typeof links;
      idx: number;
    }[];
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
    if (await confirm(`Delete "${link.title}"?`)) removeLink(id);
  };

  const handleFolderCreated = (id: string) => {
    setOpenFolders((prev) => new Set(prev).add(id));
  };

  const showEmpty = columns.length === 0;

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-6 pb-20 lg:pb-8">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">Workspace</h2>
        <p className="text-sm text-muted-foreground">
          Tasks, bookmarks, and links in one place.
        </p>
      </header>

      <SearchBar
        value={search}
        onChange={setSearch}
        onClear={() => setSearch("")}
        placeholder="Search tasks, bookmarks, URLs, folders..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Tasks: Visible by default on mobile, right column on desktop */}
        <div className={cn("lg:col-span-2", activeTab === "tasks" ? "block" : "hidden lg:block")}>
          <TodoSection searchTerm={search} />
        </div>

        {/* Launchpad: Visible when Launchpad tab is active on mobile, left column on desktop */}
        <div className={cn("lg:col-span-3 lg:order-first", activeTab === "launchpad" ? "block" : "hidden lg:block")}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Folders
            </h3>
          </div>

          {showEmpty ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
              <div className="mx-auto mb-3 w-9 h-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                <FolderOpen className="h-4 w-4" />
              </div>
              <div className="font-medium mb-1 text-sm">No folders yet</div>
              <p className="text-sm text-muted-foreground mb-4">
                Create a folder to start organizing links.
              </p>
              {canCreateFolder ? (
                <Button
                  size="sm"
                  onClick={() => useDashboardUI.getState().openFolderModal()}
                >
                  New Folder
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredColumns.map(({ col, links: colLinks, idx }) => (
                <FolderAccordion
                  key={col.id}
                  folder={col}
                  index={idx}
                  links={colLinks}
                  isOpen={searchLower ? true : openFolders.has(col.id)}
                  onToggle={toggleFolder}
                  onAddLink={(id) => useDashboardUI.getState().openLinkModal(id)}
                  onEditFolder={openEditFolderModal}
                  onEditLink={openEditLinkModal}
                  onDeleteLink={handleDeleteLink}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddLinkModal
        open={linkModalOpen}
        onOpenChange={(o) => !o && closeLinkModal()}
        editingId={editingLinkId}
        preferredColumnId={preferredColumnId}
        onRequestEditReset={closeLinkModal}
      />
      <AddFolderModal
        open={folderModalOpen}
        onOpenChange={(o) => !o && closeFolderModal()}
        editingId={editingFolderId}
        onRequestEditReset={closeFolderModal}
        onCreated={handleFolderCreated}
      />
      {ConfirmDialogElement}
    </main>
  );
}