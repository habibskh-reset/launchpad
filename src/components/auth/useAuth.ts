import { useState } from "react";
import { signInWithGoogle, signOutCurrent } from "@/services/firebase/auth";
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

  const login = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      try {
        localStorage.removeItem(LOCAL_USER_KEY);
      } catch {}
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
    } catch {}
    setUser(LOCAL_USER_PROFILE);
  };

  const logout = async () => {
    setAuthError(null);
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
    } catch {}
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