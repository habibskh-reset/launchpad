import { type ReactNode } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";

export function AuthGuard({ children }: { children: ReactNode }) {
  const user = useWorkspaceStore((state) => state.user);
  if (!user) return null;
  return <>{children}</>;
}