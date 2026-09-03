import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <main className="flex-1 max-w-5xl mx-auto w-full p-6 flex flex-col items-center justify-center text-center gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        That page doesn’t exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </main>
  );
}
