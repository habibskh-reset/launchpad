import { type ReactNode } from "react";
import { useAuth } from "./useAuth";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  return <>{children}</>;
}
