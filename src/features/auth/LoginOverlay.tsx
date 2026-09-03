import { Compass } from "lucide-react";
import { useAuth } from "./useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LoginOverlay() {
  const { user, authError, authBusy, login, loginLocal } = useAuth();
  const isHidden = !!user;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-background transition-opacity duration-150",
        isHidden && "opacity-0 pointer-events-none",
      )}
      aria-hidden={isHidden}
    >
      <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-6">
        <Compass className="w-6 h-6" strokeWidth={2.25} />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2 text-center">
        Reset Launchpad
      </h1>
      <p className="text-muted-foreground text-sm text-center max-w-sm mb-8">
        Sign in to open your workspace and sync bookmarks across devices.
      </p>
      <Button onClick={login} disabled={authBusy} size="lg" variant="outline">
        <img
          src="https://www.google.com/favicon.ico"
          className="w-4 h-4"
          alt=""
        />
        <span>Sign in with Google</span>
      </Button>
      <button
        type="button"
        onClick={loginLocal}
        className="mt-3 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors duration-150"
      >
        Continue locally (no cloud sync)
      </button>
      {authError ? (
        <div
          role="alert"
          className="mt-4 px-3 py-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-xs max-w-sm text-center"
        >
          {authError}
        </div>
      ) : null}
    </div>
  );
}
