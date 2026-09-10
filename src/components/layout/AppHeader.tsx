import { 
  Compass, 
  Download, 
  LogOut, 
  MoreVertical, 
  Settings, 
  Upload, 
  Plus, 
  Link as LinkIcon, 
  FolderPlus, 
  FileText, 
  BarChart3
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/auth/ThemeToggle";
import { useAuth } from "@/components/auth/useAuth";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useUIStore, type ActiveTab } from "@/stores/uiStore";
import { useBackup } from "@/pages/Settings/useBackup";
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
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const openAddLink = useUIStore((s) => s.openAddLink);
  const openAddFolder = useUIStore((s) => s.openAddFolder);
  const openReportPasteModal = useUIStore((s) => s.openReportPasteModal);

  const isSettings = location.pathname.includes("/settings");

  const avatarUrl =
    user?.photoURL ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.email ?? "User",
    )}&background=2563eb&color=fff`;

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div 
            onClick={() => handleNav("tasks")} 
            className="flex items-center gap-2 min-w-0 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-sm">
              <Compass className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-bold tracking-tight truncate leading-tight">
                {title}
              </h1>
              <SyncIndicator />
            </div>
          </div>
        </div>

        {/* Right Action Tools: + Quick Action Dropdown, Theme, Settings Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Universal Create Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="rounded-xl font-bold gap-1.5 shadow-sm bg-primary text-primary-foreground text-xs cursor-pointer h-8 px-3"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span className="hidden sm:inline">Add / Ingest</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 text-xs">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1">
                Quick Actions
              </DropdownMenuLabel>
              <DropdownMenuItem 
                onSelect={() => handleNav("tasks")} 
                className="cursor-pointer font-semibold py-2"
              >
                <FileText className="h-3.5 w-3.5 text-amber-500 mr-2" />
                Add Task / Note
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={openReportPasteModal} 
                className="cursor-pointer font-semibold py-2"
              >
                <BarChart3 className="h-3.5 w-3.5 text-emerald-500 mr-2" />
                Paste Gym Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={() => { handleNav("launchpad"); openAddLink(); }} 
                className="cursor-pointer font-semibold py-2"
              >
                <LinkIcon className="h-3.5 w-3.5 text-blue-500 mr-2" />
                Add Bookmark Link
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={() => { handleNav("launchpad"); openAddFolder(); }} 
                className="cursor-pointer font-semibold py-2"
              >
                <FolderPlus className="h-3.5 w-3.5 text-violet-500 mr-2" />
                New Resource Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {/* User & Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl cursor-pointer h-8 w-8" aria-label="Open menu">
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
              {user && (
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
              )}
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  Settings & Data
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={exportBackup} className="cursor-pointer">
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                Export JSON Backup
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="cursor-pointer">
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                  Import JSON Backup
                  <input
                    type="file"
                    accept=".json"
                    onChange={importBackup}
                    className="hidden"
                  />
                </label>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem danger onSelect={logout} className="cursor-pointer">
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