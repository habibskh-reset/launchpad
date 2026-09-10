import { create } from "zustand";

export type AuthMethod = "google" | "pin";
export type TimeoutOption = 5 | 15 | 30 | 60 | 0; // 0 = Never, numbers are minutes

interface SecurityState {
  authMethod: AuthMethod;
  pinCode: string | null;
  timeoutMinutes: TimeoutOption;
  isLocked: boolean;
  lastActiveTimestamp: number;
  settingsModalOpen: boolean;
  setAuthMethod: (method: AuthMethod) => void;
  setPinCode: (pin: string | null) => void;
  setTimeoutMinutes: (minutes: TimeoutOption) => void;
  setIsLocked: (locked: boolean) => void;
  recordActivity: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
}

const STORAGE_KEY = "launchpad_security_config";

function getInitialConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore storage parse errors
  }
  return {
    authMethod: "google" as AuthMethod,
    pinCode: null as string | null,
    timeoutMinutes: 15 as TimeoutOption,
  };
}

export const useSecurityStore = create<SecurityState>((set, get) => {
  const initial = getInitialConfig();
  
  // If PIN is enabled and a PIN exists, the app MUST start locked
  const shouldLockInitially = initial.authMethod === "pin" && !!initial.pinCode;

  return {
    authMethod: initial.authMethod,
    pinCode: initial.pinCode,
    timeoutMinutes: initial.timeoutMinutes,
    isLocked: shouldLockInitially,
    lastActiveTimestamp: Date.now(),
    settingsModalOpen: false,

    setAuthMethod: (method) => {
      set({ authMethod: method });
      const { pinCode, timeoutMinutes } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ authMethod: method, pinCode, timeoutMinutes }));
    },

    setPinCode: (pin) => {
      set({ pinCode: pin });
      const { authMethod, timeoutMinutes } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ authMethod, pinCode: pin, timeoutMinutes }));
    },

    setTimeoutMinutes: (minutes) => {
      set({ timeoutMinutes: minutes });
      const { authMethod, pinCode } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ authMethod, pinCode, timeoutMinutes: minutes }));
    },

    setIsLocked: (isLocked) => set({ isLocked, lastActiveTimestamp: Date.now() }),

    recordActivity: () => {
      if (!get().isLocked) {
        set({ lastActiveTimestamp: Date.now() });
      }
    },

    openSettingsModal: () => set({ settingsModalOpen: true }),
    closeSettingsModal: () => set({ settingsModalOpen: false }),
  };
});