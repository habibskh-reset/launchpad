import { useState, type FormEvent } from "react";
import { Shield, KeyRound, Clock, Check, Download, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSecurityStore, type AuthMethod, type TimeoutOption } from "@/stores/SecurityStore";
import { useBackup } from "@/pages/Settings/useBackup";
import { cn } from "@/lib/utils";

export function SecuritySettingsModal() {
  const open = useSecurityStore((s) => s.settingsModalOpen);
  const close = useSecurityStore((s) => s.closeSettingsModal);
  const authMethod = useSecurityStore((s) => s.authMethod);
  const setAuthMethod = useSecurityStore((s) => s.setAuthMethod);
  const pinCode = useSecurityStore((s) => s.pinCode);
  const setPinCode = useSecurityStore((s) => s.setPinCode);
  const timeoutMinutes = useSecurityStore((s) => s.timeoutMinutes);
  const setTimeoutMinutes = useSecurityStore((s) => s.setTimeoutMinutes);

  const { exportBackup, importBackup } = useBackup();

  const [newPin, setNewPin] = useState("");
  const [pinSaved, setPinSaved] = useState(false);

  const handleSavePin = (e: FormEvent) => {
    e.preventDefault();
    if (newPin.length >= 4 && newPin.length <= 6) {
      setPinCode(newPin);
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 2000);
      setNewPin("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-w-md p-5 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-sm font-black flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>Security, PIN & Data Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* 1. Login & Lock Method Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-primary" /> Preferred Lock Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAuthMethod("google")}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer",
                  authMethod === "google"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                )}
              >
                Google Auth
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("pin")}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer",
                  authMethod === "pin"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                )}
              >
                PIN Passcode
              </button>
            </div>
          </div>

          {/* 2. Configure 4-6 Digit PIN */}
          {authMethod === "pin" && (
            <form onSubmit={handleSavePin} className="p-3 bg-muted/30 border border-border rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground text-[11px]">
                  {pinCode ? "Change Current PIN" : "Set New Passcode (4-6 Digits)"}
                </span>
                {pinCode && <span className="text-[10px] text-emerald-500 font-bold">PIN Active</span>}
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 4-6 digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  className="h-8 text-xs font-mono bg-background"
                />
                <Button type="submit" size="sm" disabled={newPin.length < 4} className="h-8 px-3 text-xs font-bold shrink-0">
                  {pinSaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : "Save"}
                </Button>
              </div>
            </form>
          )}

          {/* 3. Session Inactivity Timeout */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> Inactivity Auto-Lock
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[5, 15, 30, 0].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTimeoutMinutes(mins as TimeoutOption)}
                  className={cn(
                    "py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer",
                    timeoutMinutes === mins
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border bg-muted/30 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mins === 0 ? "Never" : `${mins}m`}
                </button>
              ))}
            </div>
          </div>

          {/* 4. JSON Backup & Restore directly in Settings Modal */}
          <div className="pt-2 border-t border-border space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Workspace Data Backup
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportBackup} className="flex-1 text-xs h-8 font-bold">
                <Download className="w-3.5 h-3.5 mr-1" /> Export JSON
              </Button>
              <Button asChild size="sm" variant="secondary" className="flex-1 text-xs h-8 font-bold cursor-pointer">
                <label>
                  <Upload className="w-3.5 h-3.5 mr-1" /> Import JSON
                  <input type="file" accept=".json" onChange={importBackup} className="hidden" />
                </label>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}