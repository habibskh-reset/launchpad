import { ChevronDown, Pencil, Plus } from "lucide-react";
import type { Folder, LinkItem } from "@/types/workspace";
import { folderAccent } from "../themes";
import { LinkCard } from "./LinkCard";
import { cn } from "@/lib/utils";

interface FolderAccordionProps {
  folder: Folder;
  index: number;
  links: LinkItem[];
  isOpen: boolean;
  onToggle: (id: string) => void;
  onAddLink: (columnId: string) => void;
  onEditFolder: (columnId: string) => void;
  onEditLink: (id: string) => void;
  onDeleteLink: (id: string) => void;
}

export function FolderAccordion({
  folder,
  index,
  links,
  isOpen,
  onToggle,
  onAddLink,
  onEditFolder,
  onEditLink,
  onDeleteLink,
}: FolderAccordionProps) {
  const accent = folderAccent(folder.color, index);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="relative rounded-lg border border-border bg-card overflow-hidden">
      <span
        className={cn("absolute left-0 top-3 bottom-3 w-0.5 rounded-full", accent)}
        aria-hidden
      />
      <button
        type="button"
        onClick={() => onToggle(folder.id)}
        aria-expanded={isOpen}
        className="w-full pl-4 pr-3 py-3 flex items-center justify-between text-left hover:bg-muted/60 transition-colors duration-150"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-xs flex-shrink-0 text-foreground">
            <i className={folder.icon || "fa-solid fa-folder"} />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{folder.title}</div>
            <div className="text-[11px] text-muted-foreground">
              {links.length} {links.length === 1 ? "link" : "links"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5" onClick={stop}>
          <button
            type="button"
            onClick={() => onAddLink(folder.id)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150"
            title="Add link"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEditFolder(folder.id)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150"
            title="Edit folder"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <span
            className={cn(
              "ml-1 w-5 h-5 flex items-center justify-center text-muted-foreground transition-transform duration-150",
              isOpen && "rotate-180",
            )}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 pt-0 border-t border-border">
          {links.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No links yet
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1.5 pt-2">
              {links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onEdit={onEditLink}
                  onDelete={onDeleteLink}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
