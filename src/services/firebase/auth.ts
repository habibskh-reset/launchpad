import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth as getAuthInstance } from "./app";
import type { AppUser } from "@/types/auth";

const googleProvider = new GoogleAuthProvider();

function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export async function signInWithGoogle(): Promise<void> {
  const a = getAuthInstance();
  await signInWithPopup(a, googleProvider);
}

export async function signOutCurrent(): Promise<void> {
  const a = getAuthInstance();
  await signOut(a);
}

export function subscribeAuth(
  onUser: (user: AppUser | null) => void,
  onError?: (err: Error) => void,
): () => void {
  const a = getAuthInstance();
  return onAuthStateChanged(
    a,
    (user) => onUser(user ? toAppUser(user) : null),
    onError,
  );
}
