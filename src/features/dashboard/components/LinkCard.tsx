import { useState, type MouseEvent } from "react";
import { Pencil, Pin, Trash2 } from "lucide-react";
import type { LinkItem } from "@/types/workspace";
import { tryGetDomain } from "@/lib/date";
import { cn } from "@/lib/utils";

interface LinkCardProps {
  link: LinkItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const FALLBACK_FAVICON = "https://cdn-icons-png.flaticon.com/512/1006/1006771.png";

export function LinkCard({ link, onEdit, onDelete }: LinkCardProps) {
  const domain = tryGetDomain(link.url);
  const [faviconSrc, setFaviconSrc] = useState(
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
  );

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
      className="group flex items-center gap-3 rounded-md border border-transparent hover:border-border hover:bg-muted/50 px-2.5 py-2 transition-colors duration-150"
    >
      <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
        <img
          src={faviconSrc}
          onError={() => setFaviconSrc(FALLBACK_FAVICON)}
          className="w-3.5 h-3.5 rounded-sm object-contain"
          alt=""
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm truncate">{link.title}</span>
          {link.pinned ? (
            <Pin className="h-3 w-3 text-muted-foreground flex-shrink-0" fill="currentColor" />
          ) : null}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">
          {link.description || domain}
        </div>
      </div>
      <div
        className={cn(
          "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleEdit}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="p-1 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </a>
  );
}
