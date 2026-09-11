import { useState, useEffect } from "react";
import { Lock, AlertCircle, ShieldAlert } from "lucide-react";
import { useSecurityStore } from "@/stores/securityStore";
import { Button } from "@/components/ui/button";

export function PasscodeOverlay() {
  const isLocked = useSecurityStore((s) => s.isLocked);
  const unlock = useSecurityStore((s) => s.unlock);
  const lock = useSecurityStore((s) => s.lock);
  const passcode = useSecurityStore((s) => s.passcode);
  const timeoutDuration = useSecurityStore((s) => s.timeoutDuration);
  const lockOnTabSwitch = useSecurityStore((s) => s.lockOnTabSwitch);
  const lockoutUntil = useSecurityStore((s) => s.lockoutUntil);

  const [input, setInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  // Rate-limit timer countdown
  useEffect(() => {
    if (!lockoutUntil) {
      setRateLimitSeconds(0);
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setRateLimitSeconds(remaining);
      if (remaining === 0) {
        setErrorMsg(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Background inactivity and visibility listeners
  useEffect(() => {
    if (!passcode) return;

    let lastActive = Date.now();
    const updateActivity = () => {
      lastActive = Date.now();
    };

    const handleVisibility = () => {
      if (document.hidden && lockOnTabSwitch) {
        lock();
      } else {
        updateActivity();
      }
    };

    const checkLock = setInterval(() => {
      if (timeoutDuration > 0 && !isLocked && Date.now() - lastActive > timeoutDuration) {
        lock();
      }
    }, 4000);

    window.addEventListener("pointerdown", updateActivity);
    window.addEventListener("keydown", updateActivity);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(checkLock);
      window.removeEventListener("pointerdown", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [passcode, timeoutDuration, isLocked, lockOnTabSwitch, lock]);

  if (!isLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimitSeconds > 0) return;

    const res = unlock(input);
    if (res.success) {
      setInput("");
      setErrorMsg(null);
    } else if (res.rateLimited) {
      setErrorMsg("Too many attempts. Locked for 30s.");
      setInput("");
    } else {
      setErrorMsg("Incorrect passcode.");
      setInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl p-4">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-sm border border-primary/20">
        <Lock className="w-7 h-7" strokeWidth={2.25} />
      </div>

      <h2 className="text-xl font-bold tracking-tight mb-1 text-center">Workspace Locked</h2>
      <p className="text-xs text-muted-foreground mb-6 text-center max-w-xs">
        Enter your passcode to resume your active session.
      </p>

      <form onSubmit={handleUnlock} className="flex flex-col gap-3 w-full max-w-[260px]">
        <input
          type="password"
          autoFocus
          disabled={rateLimitSeconds > 0}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          className={`flex h-12 w-full rounded-xl border ${
            errorMsg ? "border-destructive bg-destructive/5" : "border-input bg-card"
          } px-3 py-2 text-center text-xl font-mono tracking-[0.4em] outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm transition-all disabled:opacity-50`}
          placeholder="••••"
          maxLength={8}
        />

        {errorMsg && (
          <div className="flex items-center justify-center gap-1.5 text-destructive text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {rateLimitSeconds > 0 && (
          <div className="flex items-center justify-center gap-1.5 text-amber-500 text-xs font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Wait {rateLimitSeconds}s to retry</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={rateLimitSeconds > 0 || !input.trim()}
          className="w-full font-bold h-10 rounded-xl mt-1 cursor-pointer"
        >
          Unlock Session
        </Button>
      </form>
    </div>
  );
}