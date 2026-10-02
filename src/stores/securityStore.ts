import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimeoutDuration = 0 | 60000 | 300000 | 900000 | 3600000;

async function hashPasscode(code: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(code + "reset-launchpad-salt-v1");
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface SecurityState {
  passcodeHash: string | null;
  isLocked: boolean;
  timeoutDuration: TimeoutDuration;
  lockOnTabSwitch: boolean;
  failedAttempts: number;
  lockoutUntil: number | null;
  
  setPasscode: (code: string) => Promise<void>;
  changePasscode: (currentCode: string, newCode: string) => Promise<boolean>;
  removePasscode: (currentCode: string) => Promise<boolean>;
  lock: () => void;
  unlock: (code: string) => Promise<{ success: boolean; rateLimited?: boolean; remainingMs?: number }>;
  setTimeoutDuration: (duration: TimeoutDuration) => void;
  setLockOnTabSwitch: (enabled: boolean) => void;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      passcodeHash: null,
      isLocked: false,
      timeoutDuration: 300000,
      lockOnTabSwitch: false,
      failedAttempts: 0,
      lockoutUntil: null,

      setPasscode: async (code) => {
        const hash = await hashPasscode(code);
        set({
          passcodeHash: hash,
          isLocked: false,
          failedAttempts: 0,
          lockoutUntil: null,
        });
      },

      changePasscode: async (currentCode, newCode) => {
        const currentHash = await hashPasscode(currentCode);
        if (get().passcodeHash === currentHash) {
          const newHash = await hashPasscode(newCode);
          set({
            passcodeHash: newHash,
            failedAttempts: 0,
            lockoutUntil: null,
          });
          return true;
        }
        return false;
      },

      removePasscode: async (currentCode) => {
        const currentHash = await hashPasscode(currentCode);
        if (get().passcodeHash === currentHash) {
          set({
            passcodeHash: null,
            isLocked: false,
            failedAttempts: 0,
            lockoutUntil: null,
          });
          return true;
        }
        return false;
      },

      lock: () => {
        if (get().passcodeHash) {
          set({ isLocked: true });
        }
      },

      unlock: async (code) => {
        const { passcodeHash, failedAttempts, lockoutUntil } = get();
        const now = Date.now();

        if (lockoutUntil && now < lockoutUntil) {
          return {
            success: false,
            rateLimited: true,
            remainingMs: lockoutUntil - now,
          };
        }

        const inputHash = await hashPasscode(code);
        if (passcodeHash === inputHash) {
          set({ isLocked: false, failedAttempts: 0, lockoutUntil: null });
          return { success: true };
        }

        const newFailed = failedAttempts + 1;
        if (newFailed >= 5) {
          const timeout = now + 30000;
          set({ failedAttempts: newFailed, lockoutUntil: timeout });
          return { success: false, rateLimited: true, remainingMs: 30000 };
        }

        set({ failedAttempts: newFailed });
        return { success: false, rateLimited: false };
      },

      setTimeoutDuration: (duration) => set({ timeoutDuration: duration }),
      setLockOnTabSwitch: (enabled) => set({ lockOnTabSwitch: enabled }),
    }),
    {
      name: "launchpad-security",
    }
  )
);