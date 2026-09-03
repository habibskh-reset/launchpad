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
  const setUser = useWorkspaceStore((s) => s.setUser);
  const user = useWorkspaceStore((s) => s.user);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // Restore local user session if previously selected
  useEffect(() => {
    try {
      const isLocal = localStorage.getItem(LOCAL_USER_KEY) === "true";
      if (isLocal && !user) {
        setUser(LOCAL_USER_PROFILE);
      }
    } catch {
      // Ignore storage access errors
    }
  }, [setUser, user]);

  useEffect(() => {
    const unsubscribe = subscribeAuth(
      (firebaseUser) => {
        // If user explicitly signed in with Firebase, clear the local override
        if (firebaseUser) {
          try {
            localStorage.removeItem(LOCAL_USER_KEY);
          } catch {
            // Ignore storage access errors
          }
          setUser(firebaseUser);
        } else if (localStorage.getItem(LOCAL_USER_KEY) === "true") {
          setUser(LOCAL_USER_PROFILE);
        } else {
          setUser(null);
        }
      },
      (err) => {
        setAuthError(toAppError(err).message);
      },
    );
    return () => unsubscribe();
  }, [setUser]);

  const login = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
      await signInWithGoogle();
    } catch (err) {
      const mapped = toAppError(err);
      if (
        mapped.message.includes("auth/internal-error") ||
        mapped.message.includes("internal-error")
      ) {
        setAuthError(
          "Sign-in failed (auth/internal-error). Enable Google provider in Firebase Console and add localhost to authorized domains. See README.",
        );
      } else {
        setAuthError(mapped.message);
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const loginLocal = () => {
    setAuthError(null);
    try {
      localStorage.setItem(LOCAL_USER_KEY, "true");
    } catch {
      // Ignore storage access errors
    }
    setUser(LOCAL_USER_PROFILE);
  };

  const logout = async () => {
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
      await signOutCurrent();
      setUser(null);
    } catch (err) {
      setAuthError(toAppError(err).message);
    }
  };

  return { user, authError, authBusy, login, loginLocal, logout };
}