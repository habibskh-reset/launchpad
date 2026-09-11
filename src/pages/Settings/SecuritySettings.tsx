import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSecurityStore, type TimeoutDuration } from "@/stores/securityStore";
import { ShieldCheck, ShieldAlert, Lock, KeyRound } from "lucide-react";

export function SecuritySettings() {
  const {
    passcode,
    setPasscode,
    changePasscode,
    removePasscode,
    lock,
    timeoutDuration,
    setTimeoutDuration,
    lockOnTabSwitch,
    setLockOnTabSwitch,
  } = useSecurityStore();

  const [newCode, setNewCode] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [currentCode, setCurrentCode] = useState("");
  const [nextCode, setNextCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isRemoving, setIsRemoving] = useState(false);
  const [removeVerifyCode, setRemoveVerifyCode] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode.trim().length >= 4) {
      setPasscode(newCode.trim());
      setNewCode("");
    }
  };

  const handleChange = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (nextCode.trim().length < 4) {
      setErrorMsg("New passcode must be at least 4 digits.");
      return;
    }
    const success = changePasscode(currentCode, nextCode.trim());
    if (success) {
      setIsChanging(false);
      setCurrentCode("");
      setNextCode("");
    } else {
      setErrorMsg("Current passcode is incorrect.");
    }
  };

  const handleRemove = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const success = removePasscode(removeVerifyCode);
    if (success) {
      setIsRemoving(false);
      setRemoveVerifyCode("");
    } else {
      setErrorMsg("Passcode incorrect.");
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          {passcode ? (
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <h2 className="font-semibold text-sm">Session Security & Passcode</h2>
            <p className="text-[11px] text-muted-foreground">
              Protect local access on this device without signing out of Firebase
            </p>
          </div>
        </div>

        {passcode && (
          <Button
            size="sm"
            variant="outline"
            onClick={lock}
            className="rounded-xl font-bold text-xs gap-1.5 cursor-pointer h-8"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Lock Now</span>
          </Button>
        )}
      </div>

      {!passcode ? (
        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          <p className="text-xs text-muted-foreground">
            Set a 4 to 8-digit passcode and select when your workspace should automatically lock.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <Label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">
                Create Passcode (4-8 Digits)
              </Label>
              <Input
                type="password"
                placeholder="••••"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                maxLength={8}
                className="font-mono tracking-widest text-sm rounded-xl h-9"
              />
            </div>

            <div>
              <Label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">
                Auto-Lock Timeout
              </Label>
              <select
                value={timeoutDuration}
                onChange={(e) => setTimeoutDuration(Number(e.target.value) as TimeoutDuration)}
                className="w-full h-9 px-2.5 rounded-xl border border-input bg-background text-xs shadow-sm outline-none"
              >
                <option value={60000}>1 Minute</option>
                <option value={300000}>5 Minutes (Default)</option>
                <option value={900000}>15 Minutes</option>
                <option value={3600000}>1 Hour</option>
                <option value={0}>Never Auto-Lock</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={newCode.trim().length < 4}
            className="rounded-xl font-bold text-xs cursor-pointer h-9 px-4"
          >
            Enable Passcode & Timeout
          </Button>
        </form>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Active status bar */}
          <div className="flex items-center justify-between bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Passcode lock is active
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsChanging((v) => !v);
                  setIsRemoving(false);
                  setErrorMsg("");
                }}
                className="h-7 text-xs rounded-lg cursor-pointer"
              >
                Change Code
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setIsRemoving((v) => !v);
                  setIsChanging(false);
                  setErrorMsg("");
                }}
                className="h-7 text-xs rounded-lg cursor-pointer"
              >
                Remove
              </Button>
            </div>
          </div>

          {/* Change Passcode inline panel */}
          {isChanging && (
            <form onSubmit={handleChange} className="p-3 bg-muted/40 rounded-xl border border-border space-y-2 text-xs">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                Change Passcode
              </div>
              <div className="flex flex-wrap gap-2">
                <Input
                  type="password"
                  placeholder="Current code"
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value)}
                  className="w-36 h-8 text-xs font-mono"
                  autoFocus
                />
                <Input
                  type="password"
                  placeholder="New code (4+ digits)"
                  value={nextCode}
                  onChange={(e) => setNextCode(e.target.value)}
                  className="w-36 h-8 text-xs font-mono"
                />
                <Button type="submit" size="sm" className="h-8 text-xs rounded-lg font-bold">
                  Save
                </Button>
              </div>
              {errorMsg && <p className="text-[11px] text-destructive font-semibold">{errorMsg}</p>}
            </form>
          )}

          {/* Remove Passcode inline panel */}
          {isRemoving && (
            <form onSubmit={handleRemove} className="p-3 bg-destructive/5 rounded-xl border border-destructive/20 space-y-2 text-xs">
              <div className="font-semibold text-destructive">Confirm Passcode Removal</div>
              <div className="flex flex-wrap gap-2">
                <Input
                  type="password"
                  placeholder="Verify passcode"
                  value={removeVerifyCode}
                  onChange={(e) => setRemoveVerifyCode(e.target.value)}
                  className="w-40 h-8 text-xs font-mono"
                  autoFocus
                />
                <Button type="submit" variant="destructive" size="sm" className="h-8 text-xs rounded-lg font-bold">
                  Confirm Remove
                </Button>
              </div>
              {errorMsg && <p className="text-[11px] text-destructive font-semibold">{errorMsg}</p>}
            </form>
          )}

          {/* Controls: Timeout & Tab Switch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border/40">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">
                Auto-Lock Inactivity Timeout
              </label>
              <select
                value={timeoutDuration}
                onChange={(e) => setTimeoutDuration(Number(e.target.value) as TimeoutDuration)}
                className="w-full h-9 px-2.5 rounded-xl border border-input bg-background text-xs shadow-sm outline-none"
              >
                <option value={60000}>1 Minute</option>
                <option value={300000}>5 Minutes</option>
                <option value={900000}>15 Minutes</option>
                <option value={3600000}>1 Hour</option>
                <option value={0}>Never Auto-Lock</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 sm:mt-5">
              <Checkbox
                id="tabSwitch"
                checked={lockOnTabSwitch}
                onCheckedChange={(c) => setLockOnTabSwitch(Boolean(c))}
              />
              <Label htmlFor="tabSwitch" className="text-xs cursor-pointer font-medium leading-tight">
                Lock immediately when switching browser tabs or minimizing
              </Label>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}