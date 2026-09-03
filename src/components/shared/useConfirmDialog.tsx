import { useCallback, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [resolver, setResolver] = useState<((ok: boolean) => void) | null>(
    null,
  );

  const confirm = useCallback(
    (msg: string) =>
      new Promise<boolean>((resolve) => {
        setMessage(msg);
        setResolver(() => resolve);
        setOpen(true);
      }),
    [],
  );

  const close = (ok: boolean) => {
    resolver?.(ok);
    setOpen(false);
    setResolver(null);
  };

  const ConfirmDialogElement = (
    <Dialog open={open} onOpenChange={(o) => !o && close(false)}>
      <DialogContent className="max-w-xs p-5 text-center">
        <DialogHeader className="justify-center mb-2">
          <div className="w-10 h-10 rounded-md bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </DialogHeader>
        <DialogTitle className="text-sm text-center font-medium">{message}</DialogTitle>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Button variant="secondary" size="sm" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={() => close(true)}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return { confirm, ConfirmDialogElement };
}
