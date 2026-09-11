import { useEffect, type ReactNode } from "react";
import { subscribeAuth } from "@/services/firebase/auth";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import type { AppUser } from "@/types/auth";

const LOCAL_USER_KEY = "launchpad_is_local_user";

const LOCAL_USER_PROFILE: AppUser = {
  uid: "local",
  email: "local@launchpad",
  displayName: "Local User",
  photoURL: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useWorkspaceStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = subscribeAuth(
      (firebaseUser) => {
        try {
          const localMode = localStorage.getItem(LOCAL_USER_KEY) === "true";
          if (firebaseUser) {
            localStorage.removeItem(LOCAL_USER_KEY);
            setUser(firebaseUser);
            return;
          }
          if (localMode) {
            setUser(LOCAL_USER_PROFILE);
            return;
          }
          setUser(null);
        } catch {
          setUser(firebaseUser ?? null);
        }
      },
      (error) => {
        console.error("Auth listener error:", error);
        setUser(null);
      }
    );

    return unsubscribe;
  }, [setUser]);

  return <>{children}</>;
}