import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { useWorkspaceSync } from "@/services/firebase/useWorkspaceSync";
import { AppShell } from "@/app/AppShell";
import { QuickCaptureModal } from "@/components/layout/QuickCaptureModal";
import { useUIStore } from "@/stores/uiStore";

export function App() {
  useWorkspaceSync();
  const captureOpen = useUIStore((s) => s.captureModalOpen);
  const openCaptureModal = useUIStore((s) => s.openCaptureModal);
  const closeCaptureModal = useUIStore((s) => s.closeCaptureModal);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openCaptureModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openCaptureModal]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeCaptureModal();
    }
  };

  return (
    <AppShell header={<AppHeader />}>
      <Outlet />
      <QuickCaptureModal
        open={captureOpen}
        onOpenChange={handleOpenChange}
      />
    </AppShell>
  );
}