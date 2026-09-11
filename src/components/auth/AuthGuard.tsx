import { type ReactNode } from "react";
import { Compass } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { LoginOverlay } from "./LoginOverlay";

export function AuthGuard({ children }: { children: ReactNode }) {
  const authState = useWorkspaceStore((state) => state.authState);

  if (authState === "initializing") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center animate-pulse-soft mb-4">
          <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} strokeWidth={2.25} />
        </div>
        <div className="text-sm font-medium text-muted-foreground animate-pulse">
          Authenticating...
        </div>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return <LoginOverlay />;
  }

  // Only render the router child components when fully authenticated
  return <>{children}</>;
}