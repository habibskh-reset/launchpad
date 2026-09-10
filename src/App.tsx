import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { useWorkspaceSync } from "@/services/firebase/useWorkspaceSync";
import { AppShell } from "@/app/AppShell";
import { QuickCaptureModal } from "@/components/layout/QuickCaptureModal";
import { SecurityLockOverlay } from "@/components/auth/SecurityLockOverlay";
import { SecuritySettingsModal } from "@/components/auth/SecuritySettingsModal";
import { useUIStore } from "@/stores/uiStore";
import { useSecurityStore } from "@/stores/securityStore";

export function App() {
  useWorkspaceSync();
  const captureOpen = useUIStore((s) => s.captureModalOpen);
  const openCaptureModal = useUIStore((s) => s.openCaptureModal);
  const closeCaptureModal = useUIStore((s) => s.closeCaptureModal);

  const timeoutMinutes = useSecurityStore((s) => s.timeoutMinutes);
  const isLocked = useSecurityStore((s) => s.isLocked);
  const setIsLocked = useSecurityStore((s) => s.setIsLocked);
  const recordActivity = useSecurityStore((s) => s.recordActivity);
  const lastActive = useSecurityStore((s) => s.lastActiveTimestamp);

  // Inactivity tracking across all input events
  useEffect(() => {
    const handleActivity = () => recordActivity();
    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });
    window.addEventListener("scroll", handleActivity, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [recordActivity]);

  // Periodic heartbeat timeout check
  useEffect(() => {
    if (timeoutMinutes === 0 || isLocked) return;

    const interval = window.setInterval(() => {
      const elapsedMinutes = (Date.now() - lastActive) / (1000 * 60);
      if (elapsedMinutes >= timeoutMinutes) {
        setIsLocked(true);
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, [timeoutMinutes, isLocked, lastActive, setIsLocked]);

  // Quick Capture shortcut
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

  return (
    <AppShell header={<AppHeader />}>
      <Outlet />
      <QuickCaptureModal open={captureOpen} onOpenChange={(open) => !open && closeCaptureModal()} />
      <SecurityLockOverlay />
      <SecuritySettingsModal />
    </AppShell>
  );
}