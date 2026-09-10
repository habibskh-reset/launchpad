import { Card } from "@/components/ui/card";
import { TrendingUp, Activity, PhoneCall, DollarSign, Wallet, CreditCard, Dumbbell } from "lucide-react";
import type { StoredReport } from "./types";

interface Props {
  reports: StoredReport[];
}

export function ReportSummaryCards({ reports }: Props) {
  const totals = reports.reduce(
    (acc, r) => ({
      newCount: acc.newCount + r.newCount,
      newAmount: acc.newAmount + r.newAmount,
      renewCount: acc.renewCount + r.renewCount,
      renewAmount: acc.renewAmount + r.renewAmount,
      balanceCount: acc.balanceCount + r.balanceCount,
      balanceAmount: acc.balanceAmount + r.balanceAmount,
      ptCount: acc.ptCount + r.ptCount,
      ptAmount: acc.ptAmount + r.ptAmount,
      otherCount: acc.otherCount + r.otherCount,
      otherAmount: acc.otherAmount + r.otherAmount,
      consultation: acc.consultation + r.consultation,
      measurement: acc.measurement + r.measurement,
      enquiryCompleted: acc.enquiryCompleted + r.enquiryCompleted,
      paymentCompleted: acc.paymentCompleted + r.paymentCompleted,
      expiryCompleted: acc.expiryCompleted + r.expiryCompleted,
      cashTotal: acc.cashTotal + r.cashTotal,
      cardTotal: acc.cardTotal + r.cardTotal,
      todayCollection: acc.todayCollection + r.todayCollection,
    }),
    {
      newCount: 0, newAmount: 0, renewCount: 0, renewAmount: 0,
      balanceCount: 0, balanceAmount: 0, ptCount: 0, ptAmount: 0,
      otherCount: 0, otherAmount: 0, consultation: 0, measurement: 0,
      enquiryCompleted: 0, paymentCompleted: 0, expiryCompleted: 0,
      cashTotal: 0, cardTotal: 0, todayCollection: 0,
    }
  );

  const totalCollFrom =
    totals.newAmount + totals.renewAmount + totals.balanceAmount + totals.ptAmount + totals.otherAmount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Assessments */}
      <Card className="p-3.5 space-y-2 bg-card border-border shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <span className="text-[11px] font-black uppercase text-muted-foreground flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-primary" /> Assessments
          </span>
          <span className="text-xs font-black text-primary">
            {totals.consultation + totals.measurement} Total
          </span>
        </div>
        <div className="space-y-2 text-xs pt-0.5">
          <div className="flex justify-between items-center bg-muted/40 px-2 py-1.5 rounded-lg">
            <span className="text-muted-foreground flex items-center gap-1">
              <Dumbbell className="h-3.5 w-3.5 text-primary" /> Consultations
            </span>
            <span className="font-black text-sm">{totals.consultation}</span>
          </div>
          <div className="flex justify-between items-center bg-muted/40 px-2 py-1.5 rounded-lg">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-primary" /> Measurements
            </span>
            <span className="font-black text-sm">{totals.measurement}</span>
          </div>
        </div>
      </Card>

      {/* 2. Follow-Ups (Done) */}
      <Card className="p-3.5 space-y-2 bg-card border-border shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <span className="text-[11px] font-black uppercase text-muted-foreground flex items-center gap-1">
            <PhoneCall className="h-3.5 w-3.5 text-amber-500" /> Follow-Ups (Done)
          </span>
          <span className="text-xs font-black text-amber-500">
            {totals.enquiryCompleted + totals.paymentCompleted + totals.expiryCompleted} Done
          </span>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Enquiries:</span>
            <span className="font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-[11px]">
              {totals.enquiryCompleted} Done
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Payment Calls:</span>
            <span className="font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-[11px]">
              {totals.paymentCompleted} Done
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Expiry Follow-ups:</span>
            <span className="font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded text-[11px]">
              {totals.expiryCompleted} Done
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Collection From */}
      <Card className="p-3.5 space-y-2 bg-card border-border shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <span className="text-[11px] font-black uppercase text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Collection From
          </span>
          <span className="text-xs font-black text-emerald-500">
            ₹{totalCollFrom.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">New Admission:</span>
            <span className="font-bold">{totals.newCount} <span className="text-muted-foreground font-normal">(₹{totals.newAmount.toLocaleString("en-IN")})</span></span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Renewal:</span>
            <span className="font-bold">{totals.renewCount} <span className="text-muted-foreground font-normal">(₹{totals.renewAmount.toLocaleString("en-IN")})</span></span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance:</span>
            <span className="font-bold">{totals.balanceCount} <span className="text-muted-foreground font-normal">(₹{totals.balanceAmount.toLocaleString("en-IN")})</span></span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">PT:</span>
            <span className="font-bold">{totals.ptCount} <span className="text-muted-foreground font-normal">(₹{totals.ptAmount.toLocaleString("en-IN")})</span></span>
          </div>
          {totals.otherCount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Others:</span>
              <span className="font-bold">{totals.otherCount} <span className="text-muted-foreground font-normal">(₹{totals.otherAmount.toLocaleString("en-IN")})</span></span>
            </div>
          )}
        </div>
      </Card>

      {/* 4. Total Collection & Cash Flow */}
      <Card className="p-3.5 space-y-2 bg-card border-border shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <span className="text-[11px] font-black uppercase text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-violet-500" /> Total Collection
          </span>
          <span className="text-xs font-black text-foreground">
            ₹{totals.todayCollection.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="space-y-2 text-xs pt-0.5">
          <div className="flex justify-between items-center bg-muted/40 px-2 py-1.5 rounded-lg">
            <span className="text-muted-foreground flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Cash
            </span>
            <span className="font-black text-sm">₹{totals.cashTotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center bg-muted/40 px-2 py-1.5 rounded-lg">
            <span className="text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5 text-blue-500" /> Card / Online
            </span>
            <span className="font-black text-sm">₹{totals.cardTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}