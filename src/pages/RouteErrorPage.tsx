import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RouteErrorPage() {
  const error = useRouteError();

  let title = "Something went wrong";
  let message =
    "The application could not load this page.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Page not found";
      message =
        "The page you requested does not exist.";
    } else {
      message =
        error.statusText ||
        "The requested page could not be loaded.";
    }
  }

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div>
            <h1 className="font-semibold">
              {title}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {message}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleReload}
          className="mt-6"
        >
          <RefreshCw className="h-4 w-4" />
          Reload Application
        </Button>
      </div>
    </main>
  );
}