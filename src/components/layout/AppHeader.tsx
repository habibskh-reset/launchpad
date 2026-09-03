import { Compass, Download, LogOut, MoreVertical, Settings, Upload } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { useAuth } from "@/features/auth/useAuth";
import { useCan } from "@/features/auth/useCan";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useDashboardUI } from "@/stores/dashboardUIStore";
import { useBackup } from "@/features/settings/useBackup";
import { SyncIndicator } from "./SyncIndicator";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const user = useWorkspaceStore((s) => s.user);
  const title = useWorkspaceStore((s) => s.workspace.settings.title);
  const { logout } = useAuth();
  const { exportBackup, importBackup } = useBackup();
  const openLinkModal = useDashboardUI((s) => s.openLinkModal);
  const openFolderModal = useDashboardUI((s) => s.openFolderModal);
  const canCreateLink = useCan("links.create");
  const canCreateFolder = useCan("folders.create");
  const canExport = useCan("backup.export");
  const canImport = useCan("backup.import");
  const location = useLocation();

  const avatarUrl =
    user?.photoURL ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.email ?? "User",
    )}&background=2563eb&color=fff`;

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-sm">
              <Compass className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight truncate">
                {title}
              </h1>
              <SyncIndicator />
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/dashboard"
              className={cn(
                "rounded-lg px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors",
                !location.pathname.includes("/settings") &&
                  "text-foreground bg-muted",
              )}
            >
              Launchpad
            </Link>
            <Link
              to="/settings"
              className={cn(
                "rounded-lg px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors",
                location.pathname.includes("/settings") &&
                  "text-foreground bg-muted",
              )}
            >
              Settings
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Always visible ThemeToggle on both Mobile & Desktop */}
          <ThemeToggle />

          {canCreateLink ? (
            <Button size="sm" onClick={() => openLinkModal()} className="hidden sm:inline-flex rounded-xl font-semibold">
              Add Link
            </Button>
          ) : null}
          {canCreateFolder ? (
            <Button variant="secondary" size="sm" onClick={openFolderModal} className="hidden sm:inline-flex rounded-xl font-semibold">
              <span>Folder</span>
            </Button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-xl" aria-label="Open menu">
                {user ? (
                  <img
                    src={avatarUrl}
                    className="w-6 h-6 rounded-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <MoreVertical className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl">
              {user ? (
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate text-xs font-semibold">
                      {user.displayName ?? "Workspace User"}
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
              ) : null}
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  Settings
                </Link>
              </DropdownMenuItem>
              {canExport ? (
                <DropdownMenuItem onSelect={exportBackup}>
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  Export Backup
                </DropdownMenuItem>
              ) : null}
              {canImport ? (
                <DropdownMenuItem asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                    Import Backup
                    <input
                      type="file"
                      accept=".json"
                      onChange={importBackup}
                      className="hidden"
                    />
                  </label>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem danger onSelect={logout}>
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}