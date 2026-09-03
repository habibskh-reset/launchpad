import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { useWorkspaceSync } from "@/features/dashboard/hooks/useWorkspaceSync";
import { AppShell } from "@/app/AppShell";

export function App() {
  useWorkspaceSync();
  return (
    <AppShell header={<AppHeader />}>
      <Outlet />
    </AppShell>
  );
}
