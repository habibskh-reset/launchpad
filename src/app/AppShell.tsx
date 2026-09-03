import { type ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ListChecks, Settings } from "lucide-react";
import { useDashboardUI } from "@/stores/dashboardUIStore";
import { cn } from "@/lib/utils";

interface AppShellProps {
  header: ReactNode;
  children: ReactNode;
}

export function AppShell({ header, children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const activeTab = useDashboardUI((s) => s.activeTab);
  const setActiveTab = useDashboardUI((s) => s.setActiveTab);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isSettings = location.pathname.includes("/settings");

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground overflow-x-hidden">
      <div className="w-full">{header}</div>
      <div className="flex-1">{children}</div>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-6xl mx-auto grid grid-cols-3 text-xs font-semibold text-muted-foreground">
            {/* Tasks Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("tasks");
                if (location.pathname !== "/dashboard") navigate("/dashboard");
              }}
              className={cn(
                "flex flex-col items-center py-2.5 transition-colors",
                !isSettings && activeTab === "tasks" ? "text-primary font-bold" : "hover:text-foreground",
              )}
            >
              <ListChecks className="h-4 w-4 mb-0.5" />
              <span>Tasks</span>
            </button>

            {/* Launchpad Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("launchpad");
                if (location.pathname !== "/dashboard") navigate("/dashboard");
              }}
              className={cn(
                "flex flex-col items-center py-2.5 transition-colors",
                !isSettings && activeTab === "launchpad" ? "text-primary font-bold" : "hover:text-foreground",
              )}
            >
              <Home className="h-4 w-4 mb-0.5" />
              <span>Launchpad</span>
            </button>

            {/* Settings Tab */}
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className={cn(
                "flex flex-col items-center py-2.5 transition-colors",
                isSettings ? "text-primary font-bold" : "hover:text-foreground",
              )}
            >
              <Settings className="h-4 w-4 mb-0.5" />
              <span>Settings</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}