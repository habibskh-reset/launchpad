import { useState, useEffect, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StoredReport } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: StoredReport | null;
  onSave: (updated: StoredReport) => void;
}

export function EditReportModal({ open, onOpenChange, report, onSave }: Props) {
  const [form, setForm] = useState<StoredReport | null>(report);

  useEffect(() => {
    setForm(report);
  }, [report, open]);

  if (!form) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
    onOpenChange(false);
  };

  const update = (field: keyof StoredReport, val: any) => {
    setForm((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: Number(val) || 0 } as unknown as StoredReport;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-5">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">
            Edit Entry: {form.date} ({form.dayName})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase">New Adm (Count / ₹)</label>
              <div className="flex gap-1 mt-0.5">
                <Input type="number" value={form.newCount} onChange={(e) => update("newCount", e.target.value)} className="h-8 text-xs" />
                <Input type="number" value={form.newAmount} onChange={(e) => update("newAmount", e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Renewal (Count / ₹)</label>
              <div className="flex gap-1 mt-0.5">
                <Input type="number" value={form.renewCount} onChange={(e) => update("renewCount", e.target.value)} className="h-8 text-xs" />
                <Input type="number" value={form.renewAmount} onChange={(e) => update("renewAmount", e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Balance (Count / ₹)</label>
              <div className="flex gap-1 mt-0.5">
                <Input type="number" value={form.balanceCount} onChange={(e) => update("balanceCount", e.target.value)} className="h-8 text-xs" />
                <Input type="number" value={form.balanceAmount} onChange={(e) => update("balanceAmount", e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-violet-500 uppercase">PT (Count / ₹)</label>
              <div className="flex gap-1 mt-0.5">
                <Input type="number" value={form.ptCount} onChange={(e) => update("ptCount", e.target.value)} className="h-8 text-xs border-violet-500/50" />
                <Input type="number" value={form.ptAmount} onChange={(e) => update("ptAmount", e.target.value)} className="h-8 text-xs border-violet-500/50" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-border">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Cash (₹)</label>
              <Input type="number" value={form.cashTotal} onChange={(e) => update("cashTotal", e.target.value)} className="h-8 text-xs mt-0.5" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Card / Online (₹)</label>
              <Input type="number" value={form.cardTotal} onChange={(e) => update("cardTotal", e.target.value)} className="h-8 text-xs mt-0.5" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-emerald-500 uppercase">Collection (₹)</label>
              <Input type="number" value={form.todayCollection} onChange={(e) => update("todayCollection", e.target.value)} className="h-8 text-xs mt-0.5 font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Attendance</label>
              <Input type="number" value={form.attendance} onChange={(e) => update("attendance", e.target.value)} className="h-8 text-xs mt-0.5" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}