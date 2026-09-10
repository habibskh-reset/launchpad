import { useEffect, useState } from "react";
import { subscribeAuth, signInWithGoogle, signOutCurrent } from "@/services/firebase/auth";
import { toAppError } from "@/shared/api/errors";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import type { AppUser } from "@/types/auth";

const LOCAL_USER_KEY = "launchpad_is_local_user";

const LOCAL_USER_PROFILE: AppUser = {
  uid: "local",
  email: "local@launchpad",
  displayName: "Local User",
  photoURL: null,
};

export function useAuth() {
  const setUser = useWorkspaceStore((state) => state.setUser);
  const user = useWorkspaceStore((state) => state.user);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

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
        setAuthError(toAppError(error).message);
      },
    );

    return unsubscribe;
  }, [setUser]);

  const login = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      try {
        localStorage.removeItem(LOCAL_USER_KEY);
      } catch {
        // Ignore
      }
      await signInWithGoogle();
    } catch (error) {
      setAuthError(toAppError(error).message);
    } finally {
      setAuthBusy(false);
    }
  };

  const loginLocal = () => {
    setAuthError(null);
    try {
      localStorage.setItem(LOCAL_USER_KEY, "true");
    } catch {
      // Ignore
    }
    setUser(LOCAL_USER_PROFILE);
  };

  const logout = async () => {
    setAuthError(null);
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
    } catch {
      // Ignore
    }
    try {
      await signOutCurrent();
    } catch (error) {
      if (user && user.uid !== "local") {
        setAuthError(toAppError(error).message);
        return;
      }
    }
    setUser(null);
  };

  return { user, authError, authBusy, login, loginLocal, logout };
}