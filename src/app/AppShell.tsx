import { type ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Compass, ListChecks } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

interface AppShellProps {
  header: ReactNode;
  children: ReactNode;
}

export function AppShell({ header, children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground overflow-x-hidden">
      <div className="w-full">{header}</div>
      <div className="flex-1">{children}</div>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-6xl mx-auto grid grid-cols-3 text-xs font-semibold text-muted-foreground">
            {/* 1. Tasks & Scratchpad */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("tasks");
                if (location.pathname !== "/dashboard") navigate("/dashboard");
              }}
              className={cn(
                "flex flex-col items-center py-2.5 transition-colors cursor-pointer",
                activeTab === "tasks" ? "text-primary font-bold" : "hover:text-foreground",
              )}
            >
              <ListChecks className="h-4 w-4 mb-0.5" />
              <span>Tasks</span>
            </button>

            {/* 2. Gym Report */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("reports");
                if (location.pathname !== "/dashboard") navigate("/dashboard");
              }}
              className={cn(
                "flex flex-col items-center py-2.5 transition-colors cursor-pointer",
                activeTab === "reports" ? "text-primary font-bold" : "hover:text-foreground",
              )}
            >
              <BarChart3 className="h-4 w-4 mb-0.5" />
              <span>Gym Report</span>
            </button>

            {/* 3. Resources */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("launchpad");
                if (location.pathname !== "/dashboard") navigate("/dashboard");
              }}
              className={cn(
                "flex flex-col items-center py-2.5 transition-colors cursor-pointer",
                activeTab === "launchpad" ? "text-primary font-bold" : "hover:text-foreground",
              )}
            >
              <Compass className="h-4 w-4 mb-0.5" />
              <span>Resources</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}