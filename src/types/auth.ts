import type { AppError } from "@/shared/api/errors";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type SyncStatus = "active" | "error" | "offline";

export interface SyncState {
  status: SyncStatus;
  message: string;
  error?: AppError;
}
