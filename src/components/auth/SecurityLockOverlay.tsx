import { useState, useEffect } from "react";
import { Lock, Delete, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSecurityStore } from "./SecuritySettingsModal";
import { useAuth } from "./useAuth";

export function SecurityLockOverlay() {
  const isLocked = useSecurityStore((s) => s.isLocked);
  const setIsLocked = useSecurityStore((s) => s.setIsLocked);
  const authMethod = useSecurityStore((s) => s.authMethod);
  const correctPin = useSecurityStore((s) => s.pinCode);
  const recordActivity = useSecurityStore((s) => s.recordActivity);
  const { logout } = useAuth();

  const [inputPin, setInputPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleActivity = () => recordActivity();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("click", handleActivity);

    const interval = setInterval(() => {
      const state = useSecurityStore.getState();
      if (!state.isLocked && state.timeoutMinutes > 0 && state.authMethod === "pin" && state.pinCode) {
        const elapsed = Date.now() - state.lastActiveTimestamp;
        if (elapsed >= state.timeoutMinutes * 60 * 1000) {
          state.setIsLocked(true);
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("click", handleActivity);
      clearInterval(interval);
    };
  }, [recordActivity]);

  if (!isLocked) return null;

  const handleDigit = (digit: string) => {
    if (inputPin.length >= 6) return;
    const next = inputPin + digit;
    setInputPin(next);
    setErrorMsg("");

    if (correctPin && next === correctPin) {
      setIsLocked(false);
      setInputPin("");
      recordActivity();
    } else if (correctPin && next.length >= correctPin.length) {
      setErrorMsg("Incorrect PIN");
    }
  };

  const handleBackspace = () => {
    setInputPin((prev) => prev.slice(0, -1));
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none">
      <div className="max-w-xs w-full flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
          <Lock className="w-7 h-7 stroke-[2.5]" />
        </div>

        <div>
          <h2 className="text-lg font-black tracking-tight">App Locked</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {authMethod === "pin" ? "Enter your PIN code to unlock" : "Session locked for security"}
          </p>
        </div>

        {authMethod === "pin" && correctPin ? (
          <div className="w-full space-y-4">
            <div className="flex justify-center gap-3 py-2">
              {Array.from({ length: correctPin.length }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border border-primary transition-all ${
                    inputPin.length > idx ? "bg-primary scale-110" : "bg-transparent"
                  }`}
                />
              ))}
            </div>

            {errorMsg && <p className="text-xs font-bold text-destructive">{errorMsg}</p>}

            <div className="grid grid-cols-3 gap-2 pt-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigit(num)}
                  className="h-12 rounded-xl bg-card border border-border text-base font-bold text-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handleDigit("0")}
                className="h-12 rounded-xl bg-card border border-border text-base font-bold text-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-2 w-full">
            <Button
              onClick={() => setIsLocked(false)}
              className="w-full font-bold rounded-xl h-10 cursor-pointer"
            >
              Resume Session
            </Button>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsLocked(false);
            logout();
          }}
          className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5 pt-2 cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out / Switch Account</span>
        </button>
      </div>
    </div>
  );
}