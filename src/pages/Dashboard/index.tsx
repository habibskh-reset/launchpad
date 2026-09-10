import { useState } from "react";
import { useUIStore, type ActiveTab } from "@/stores/uiStore";
import { SearchBar } from "@/components/layout/SearchBar";
import { TasksPage } from "@/pages/Tasks";
import { LaunchpadPage } from "@/pages/Launchpad";
import { ReportsPage } from "@/pages/Reports";
import { cn } from "@/lib/utils";

const TABS: { id: ActiveTab; label: string }[] = [
  { id: "tasks", label: "Tasks & Scratchpad" },
  { id: "reports", label: "Gym Nation" },
  { id: "launchpad", label: "Resources" },
];

export function DashboardPage() {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const [search, setSearch] = useState("");

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full p-2.5 sm:p-4 md:p-6 flex flex-col gap-3.5 pb-20 lg:pb-8">
      {/* Top Header: Hidden on mobile (handled by bottom nav), visible on desktop */}
      <div className="hidden lg:flex items-center justify-between gap-2.5 border-b border-border/40 pb-2.5">
        <div className="flex rounded-xl bg-muted p-1 text-xs font-semibold gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all cursor-pointer text-center",
                activeTab === t.id
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
            placeholder="Search tasks, notes, or links..."
          />
        </div>
      </div>

      {/* Dynamic Views */}
      {activeTab === "tasks" && <TasksPage searchTerm={search} />}
      {activeTab === "reports" && <ReportsPage />}
      {activeTab === "launchpad" && <LaunchpadPage searchTerm={search} />}
    </main>
  );
}