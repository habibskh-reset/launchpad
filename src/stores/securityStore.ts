import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimeoutDuration = 0 | 60000 | 300000 | 900000 | 3600000; // 0 (Never), 1m, 5m, 15m, 1h

interface SecurityState {
  passcode: string | null;
  isLocked: boolean;
  timeoutDuration: TimeoutDuration;
  lockOnTabSwitch: boolean;
  failedAttempts: number;
  lockoutUntil: number | null;
  
  // Actions
  setPasscode: (code: string) => void;
  changePasscode: (currentCode: string, newCode: string) => boolean;
  removePasscode: (currentCode: string) => boolean;
  lock: () => void;
  unlock: (code: string) => { success: boolean; rateLimited?: boolean; remainingMs?: number };
  setTimeoutDuration: (duration: TimeoutDuration) => void;
  setLockOnTabSwitch: (enabled: boolean) => void;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      passcode: null,
      isLocked: false,
      timeoutDuration: 300000, // 5 min default
      lockOnTabSwitch: false,
      failedAttempts: 0,
      lockoutUntil: null,

      setPasscode: (code) =>
        set({
          passcode: code,
          isLocked: false,
          failedAttempts: 0,
          lockoutUntil: null,
        }),

      changePasscode: (currentCode, newCode) => {
        if (get().passcode === currentCode) {
          set({
            passcode: newCode,
            failedAttempts: 0,
            lockoutUntil: null,
          });
          return true;
        }
        return false;
      },

      removePasscode: (currentCode) => {
        if (get().passcode === currentCode) {
          set({
            passcode: null,
            isLocked: false,
            failedAttempts: 0,
            lockoutUntil: null,
          });
          return true;
        }
        return false;
      },

      lock: () => {
        if (get().passcode) {
          set({ isLocked: true });
        }
      },

      unlock: (code) => {
        const { passcode, failedAttempts, lockoutUntil } = get();
        const now = Date.now();

        if (lockoutUntil && now < lockoutUntil) {
          return {
            success: false,
            rateLimited: true,
            remainingMs: lockoutUntil - now,
          };
        }

        if (passcode === code) {
          set({ isLocked: false, failedAttempts: 0, lockoutUntil: null });
          return { success: true };
        }

        const newFailed = failedAttempts + 1;
        if (newFailed >= 5) {
          const timeout = now + 30000; // 30 second throttle
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