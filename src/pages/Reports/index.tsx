import { useState, useMemo, useEffect } from "react";
import { 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/uiStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { createId } from "@/lib/id";
import { cn } from "@/lib/utils";
import { 
  type StoredReport, 
  safeInt, 
  DAY_NAMES, 
  parseGNReportText, 
  getWorkWeekRange 
} from "./types";
import { ReportSummaryCards } from "./ReportSummaryCards";

const LEGACY_STORAGE_KEY = "launchpad_gn_reports";

export function ReportsPage() {
  const [rawText, setRawText] = useState("");
  const [period, setPeriod] = useState<"month" | "week" | "year">("month");
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  
  const reportPasteModalOpen = useUIStore((s) => s.reportPasteModalOpen);
  const closeReportPasteModal = useUIStore((s) => s.closeReportPasteModal);
  const openReportPasteModal = useUIStore((s) => s.openReportPasteModal);

  const [ledgerOpen, setLedgerOpen] = useState(false);

  const reports = useWorkspaceStore((s) => s.workspace.reports || []);
  const setReports = useWorkspaceStore((s) => s.setReports);

  // Reset selected period when switching between Month/Week/Year views
  useEffect(() => {
    setSelectedGroupKey(null);
  }, [period]);

  useEffect(() => {
    if (reports.length === 0) {
      try {
        const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacySaved) {
          const parsedLegacy: any[] = JSON.parse(legacySaved);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            const migrated: StoredReport[] = parsedLegacy.map((item) => {
              let d = item.date || "";
              if (d.includes("-") && d.split("-")[0].length === 4) {
                const [y, m, day] = d.split("-");
                d = `${day}-${m}-${y}`;
              }
              const [dayStr, mStr, yStr] = d.split("-");
              const jsDate = new Date(safeInt(yStr), safeInt(mStr) - 1, safeInt(dayStr));
              const ts = jsDate.getTime();

              let newAmount = safeInt(item.newAmount);
              let renewAmount = safeInt(item.renewAmount);
              let balanceAmount = safeInt(item.balanceAmount);
              let ptCount = safeInt(item.ptCount);
              let ptAmount = safeInt(item.ptAmount);
              let todayCollection = safeInt(item.todayCollection);

              const knownSum = newAmount + renewAmount + balanceAmount;
              if (ptAmount === 0 && todayCollection > knownSum) {
                ptAmount = todayCollection - knownSum;
                ptCount = ptCount || 1;
              }

              return {
                id: item.id || createId("rep"),
                date: d,
                dayName: item.dayName || DAY_NAMES[jsDate.getDay()] || "",
                sortTimestamp: isNaN(ts) ? Date.now() : ts,
                newCount: safeInt(item.newCount),
                newAmount,
                renewCount: safeInt(item.renewCount),
                renewAmount,
                balanceCount: safeInt(item.balanceCount),
                balanceAmount,
                ptCount,
                ptAmount,
                otherCount: safeInt(item.otherCount),
                otherAmount,
                consultation: safeInt(item.consultation),
                measurement: safeInt(item.measurement),
                enquiryCompleted: safeInt(item.enquiryCompleted),
                paymentCompleted: safeInt(item.paymentCompleted),
                expiryCompleted: safeInt(item.expiryCompleted),
                cashTotal: safeInt(item.cashTotal),
                cardTotal: safeInt(item.cardTotal),
                todayCollection,
                availableCash: safeInt(item.availableCash),
                attendance: safeInt(item.attendance),
                rawText: item.rawText,
              };
            });

            setReports(() => migrated);
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          }
        }
      } catch (err) {
        console.error("Migration error:", err);
      }
    }
  }, [reports.length, setReports]);

  const handleProcess = () => {
    if (!rawText.trim()) return;
    const parsed = parseGNReportText(rawText);
    if (!parsed) {
      alert("Could not recognize report text. Verify format and try again.");
      return;
    }

    const [day, m, y] = parsed.date.split("-");
    const ts = new Date(safeInt(y), safeInt(m) - 1, safeInt(day)).getTime();

    const newReport: StoredReport = {
      ...parsed,
      id: createId("rep"),
      sortTimestamp: isNaN(ts) ? Date.now() : ts,
    };

    setReports((prev) =>
      [newReport, ...prev.filter((r) => r.date !== newReport.date)].sort(
        (a, b) => b.sortTimestamp - a.sortTimestamp
      )
    );

    setRawText("");
    closeReportPasteModal();
    // Auto-reset to show the latest group when a new report is added
    setSelectedGroupKey(null);
  };

  const handleDelete = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const activeReports = useMemo(() => {
    if (reports.length === 0) return [];
    
    // Default to the latest report's date if no group is manually selected
    const latestDate = new Date(reports[0].sortTimestamp);
    let latestGroupKey = "";
    if (period === "week") {
      latestGroupKey = getWorkWeekRange(latestDate).key;
    } else if (period === "month") {
      latestGroupKey = `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, "0")}`;
    } else {
      latestGroupKey = `${latestDate.getFullYear()}`;
    }

    const targetKey = selectedGroupKey || latestGroupKey;

    return reports.filter((r) => {
      const rDate = new Date(r.sortTimestamp);
      let rKey = "";
      if (period === "week") {
        rKey = getWorkWeekRange(rDate).key;
      } else if (period === "month") {
        rKey = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, "0")}`;
      } else {
        rKey = `${rDate.getFullYear()}`;
      }
      return rKey === targetKey;
    });
  }, [reports, period, selectedGroupKey]);

  const totals = useMemo(() => {
    return activeReports.reduce(
      (acc, r) => ({
        newCount: acc.newCount + r.newCount,
        newAmount: acc.newAmount + r.newAmount,
        renewCount: acc.renewCount + r.renewCount,
        renewAmount: acc.renewAmount + r.renewAmount,
        balanceCount: acc.balanceCount + r.balanceCount,
        balanceAmount: acc.balanceAmount + r.balanceAmount,
        ptCount: acc.ptCount + r.ptCount,
        ptAmount: acc.ptAmount + r.ptAmount,
        consultation: acc.consultation + r.consultation,
        measurement: acc.measurement + r.measurement,
        enquiryCompleted: acc.enquiryCompleted + r.enquiryCompleted,
        paymentCompleted: acc.paymentCompleted + r.paymentCompleted,
        expiryCompleted: acc.expiryCompleted + r.expiryCompleted,
        cashTotal: acc.cashTotal + r.cashTotal,
        cardTotal: acc.cardTotal + r.cardTotal,
        todayCollection: acc.todayCollection + r.todayCollection,
        attendance: acc.attendance + r.attendance,
      }),
      {
        newCount: 0, newAmount: 0, renewCount: 0, renewAmount: 0,
        balanceCount: 0, balanceAmount: 0, ptCount: 0, ptAmount: 0,
        consultation: 0, measurement: 0, enquiryCompleted: 0,
        paymentCompleted: 0, expiryCompleted: 0,
        cashTotal: 0, cardTotal: 0, todayCollection: 0, attendance: 0,
      }
    );
  }, [activeReports]);

  const periodicBreakdown = useMemo(() => {
    const groups: Record<string, { 
      key: string;
      label: string; 
      collection: number; 
      newAdm: number; 
      renew: number; 
      balance: number; 
      pt: number; 
      consultation: number;
      measurement: number;
      cash: number; 
      card: number; 
      count: number;
    }> = {};

    reports.forEach((r) => {
      const d = new Date(r.sortTimestamp);
      let groupKey = "";
      let groupLabel = "";

      if (period === "week") {
        const week = getWorkWeekRange(d);
        groupKey = week.key;
        groupLabel = week.label;
      } else if (period === "month") {
        groupKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        groupLabel = d.toLocaleString("en-IN", { month: "long", year: "numeric" });
      } else {
        groupKey = `${d.getFullYear()}`;
        groupLabel = `Year ${d.getFullYear()}`;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          label: groupLabel,
          collection: 0,
          newAdm: 0,
          renew: 0,
          balance: 0,
          pt: 0,
          consultation: 0,
          measurement: 0,
          cash: 0,
          card: 0,
          count: 0,
        };
      }

      groups[groupKey].collection += r.todayCollection;
      groups[groupKey].newAdm += r.newAmount;
      groups[groupKey].renew += r.renewAmount;
      groups[groupKey].balance += r.balanceAmount;
      groups[groupKey].pt += r.ptAmount;
      groups[groupKey].consultation += r.consultation;
      groups[groupKey].measurement += r.measurement;
      groups[groupKey].cash += r.cashTotal;
      groups[groupKey].card += r.cardTotal;
      groups[groupKey].count += 1;
    });

    return Object.values(groups);
  }, [reports, period]);

  return (
    <div className="flex flex-col gap-4 max-w-full mx-auto w-full pb-20 px-1 sm:px-3">
      {/* 1. Header & Period Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-muted p-1 text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => setPeriod("month")}
              className={cn(
                "px-3 py-1 rounded-lg transition-all font-bold cursor-pointer",
                period === "month" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setPeriod("week")}
              className={cn(
                "px-3.5 py-1 rounded-lg transition-all font-bold cursor-pointer",
                period === "week" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setPeriod("year")}
              className={cn(
                "px-3 py-1 rounded-lg transition-all font-bold cursor-pointer",
                period === "year" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Yearly
            </button>
          </div>

          <Button
            size="sm"
            onClick={openReportPasteModal}
            className="rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1 h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Paste Day</span>
          </Button>
        </div>
      </div>

      {/* 2. Paste Container */}
      {reportPasteModalOpen && (
        <div className="p-4 bg-card border-2 border-primary/40 rounded-2xl space-y-3 shadow-xl animate-in fade-in-50">
          <div className="flex justify-between items-center text-xs font-bold text-foreground">
            <span className="uppercase text-primary font-bold">Paste Daily Gym Nation WhatsApp Report</span>
            <button 
              type="button"
              onClick={closeReportPasteModal} 
              className="px-2.5 py-1 rounded-lg bg-muted text-xs hover:text-foreground font-semibold cursor-pointer transition-colors"
            >
              ✕ Close
            </button>
          </div>
          <textarea
            rows={6}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Here is the GN report of 01-09-2026 to 01-09-2026:&#10;Admissions:&#10;- Balance..."
            className="w-full bg-background border border-border rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-primary outline-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={closeReportPasteModal} className="font-bold text-xs rounded-xl cursor-pointer">
              Cancel
            </Button>
            <Button size="sm" onClick={handleProcess} disabled={!rawText.trim()} className="font-bold text-xs rounded-xl cursor-pointer">
              Process & Add Entry
            </Button>
          </div>
        </div>
      )}

      {/* 3. Summary Cards (Filtered to Active Period) */}
      <ReportSummaryCards reports={activeReports} />

      {/* 4. Performance Summary Table (Interactive Navigation) */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="px-3 py-2 bg-muted/40 border-b border-border flex justify-between items-center text-xs font-bold uppercase text-muted-foreground">
          <span>{period === "month" ? "Monthly" : period === "week" ? "Weekly" : "Yearly"} Performance Summary</span>
          <span className="text-[10px] lowercase font-normal italic">click a row to filter ledger below</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
            <thead className="bg-muted/30 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
              <tr>
                <th className="p-2 border-r border-border sticky left-0 bg-muted/95 z-20">Period</th>
                <th className="p-2 border-r border-border text-right">Total Collection</th>
                <th className="p-2 border-r border-border text-right">New Adm</th>
                <th className="p-2 border-r border-border text-right">Renewal</th>
                <th className="p-2 border-r border-border text-right">Balance</th>
                <th className="p-2 border-r border-border text-right">PT</th>
                <th className="p-2 border-r border-border text-center">Consult</th>
                <th className="p-2 border-r border-border text-center">Meas</th>
                <th className="p-2 border-r border-border text-right">Cash</th>
                <th className="p-2 border-r border-border text-right">Card/Online</th>
                <th className="p-2 text-center">Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {periodicBreakdown.map((row, idx) => {
                const isActive = selectedGroupKey 
                  ? selectedGroupKey === row.key 
                  : idx === 0; // Default to first (latest) row if nothing selected

                return (
                  <tr 
                    key={row.key} 
                    onClick={() => setSelectedGroupKey(row.key)}
                    className={cn(
                      "font-medium cursor-pointer transition-colors",
                      isActive ? "bg-primary/15 hover:bg-primary/20" : "hover:bg-muted/30"
                    )}
                  >
                    <td className={cn(
                      "p-2 font-bold border-r border-border sticky left-0 z-10",
                      isActive ? "text-primary bg-primary/5" : "text-foreground bg-card"
                    )}>
                      {row.label}
                    </td>
                    <td className="p-2 border-r border-border text-right font-black text-emerald-500">₹{row.collection.toLocaleString("en-IN")}</td>
                    <td className="p-2 border-r border-border text-right">₹{row.newAdm.toLocaleString("en-IN")}</td>
                    <td className="p-2 border-r border-border text-right">₹{row.renew.toLocaleString("en-IN")}</td>
                    <td className="p-2 border-r border-border text-right">₹{row.balance.toLocaleString("en-IN")}</td>
                    <td className="p-2 border-r border-border text-right">₹{row.pt.toLocaleString("en-IN")}</td>
                    <td className="p-2 border-r border-border text-center font-bold">{row.consultation}</td>
                    <td className="p-2 border-r border-border text-center font-bold">{row.measurement}</td>
                    <td className="p-2 border-r border-border text-right">₹{row.cash.toLocaleString("en-IN")}</td>
                    <td className="p-2 border-r border-border text-right">₹{row.card.toLocaleString("en-IN")}</td>
                    <td className="p-2 text-center font-bold">{row.count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Daily Detail Ledger (Filtered to Active Period) */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div 
          onClick={() => setLedgerOpen((prev) => !prev)}
          className="px-3 py-2.5 bg-muted/40 hover:bg-muted/60 border-b border-border flex justify-between items-center cursor-pointer select-none transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-muted-foreground">
              Daily Detail Ledger ({activeReports.length} Entries)
            </span>
            <span className="text-[10px] text-muted-foreground font-normal">
              {ledgerOpen ? "• Click to collapse" : "• Click to expand"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
            <span>{ledgerOpen ? "Collapse" : "Expand"}</span>
            {ledgerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>

        {ledgerOpen && (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
              <thead className="bg-muted/60 sticky top-0 z-30 border-b border-border text-[10px] uppercase font-bold text-muted-foreground shadow-sm">
                <tr>
                  <th className="p-2.5 border-r border-border sticky left-0 bg-muted/95 z-40">Date & Day</th>
                  <th className="p-2.5 border-r border-border">New Adm (₹)</th>
                  <th className="p-2.5 border-r border-border">Renewal (₹)</th>
                  <th className="p-2.5 border-r border-border">Balance (₹)</th>
                  <th className="p-2.5 border-r border-border">PT (₹)</th>
                  <th className="p-2.5 border-r border-border text-center">Consult</th>
                  <th className="p-2.5 border-r border-border text-center">Meas</th>
                  <th className="p-2.5 border-r border-border">Follow-ups (Done)</th>
                  <th className="p-2.5 border-r border-border text-right">Cash</th>
                  <th className="p-2.5 border-r border-border text-right">Card</th>
                  <th className="p-2.5 border-r border-border text-right font-black">Collection</th>
                  <th className="p-2.5 border-r border-border text-center">Footfall</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeReports.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-muted-foreground">
                      No data logged for this period.
                    </td>
                  </tr>
                ) : (
                  activeReports.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/20 font-medium">
                      <td className="p-2 border-r border-border font-bold text-foreground sticky left-0 bg-card z-10">
                        <span>{r.date}</span>
                        <span className="text-[10px] text-primary font-normal ml-1.5">({r.dayName.slice(0, 3)})</span>
                      </td>

                      <td className="p-2 border-r border-border">
                        {r.newCount > 0 ? (
                          <span><strong className="text-emerald-500">{r.newCount}</strong> (₹{r.newAmount.toLocaleString("en-IN")})</span>
                        ) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="p-2 border-r border-border">
                        {r.renewCount > 0 ? (
                          <span><strong className="text-blue-500">{r.renewCount}</strong> (₹{r.renewAmount.toLocaleString("en-IN")})</span>
                        ) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="p-2 border-r border-border">
                        {r.balanceCount > 0 ? (
                          <span><strong className="text-amber-500">{r.balanceCount}</strong> (₹{r.balanceAmount.toLocaleString("en-IN")})</span>
                        ) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="p-2 border-r border-border">
                        {r.ptCount > 0 ? (
                          <span><strong>{r.ptCount}</strong> (₹{r.ptAmount.toLocaleString("en-IN")})</span>
                        ) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="p-2 border-r border-border text-center font-bold">
                        {r.consultation || "-"}
                      </td>
                      <td className="p-2 border-r border-border text-center font-bold">
                        {r.measurement || "-"}
                      </td>
                      <td className="p-2 border-r border-border">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 py-0.5 rounded font-bold">
                            E: {r.enquiryCompleted}
                          </span>
                          <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded font-bold">
                            P: {r.paymentCompleted}
                          </span>
                          <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1 py-0.5 rounded font-bold">
                            Ex: {r.expiryCompleted}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 border-r border-border text-right">
                        ₹{r.cashTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="p-2 border-r border-border text-right">
                        ₹{r.cardTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="p-2 border-r border-border text-right font-black text-emerald-500">
                        ₹{r.todayCollection.toLocaleString("en-IN")}
                      </td>
                      <td className="p-2 border-r border-border text-center font-bold">
                        {r.attendance || "-"}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                          title="Delete row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {activeReports.length > 0 && (
                <tfoot className="bg-muted/50 border-t-2 border-border font-black text-xs">
                  <tr>
                    <td className="p-2.5 border-r border-border uppercase sticky left-0 bg-muted z-10">TOTAL</td>
                    <td className="p-2.5 border-r border-border text-emerald-500">{totals.newCount} (₹{totals.newAmount.toLocaleString("en-IN")})</td>
                    <td className="p-2.5 border-r border-border text-blue-500">{totals.renewCount} (₹{totals.renewAmount.toLocaleString("en-IN")})</td>
                    <td className="p-2.5 border-r border-border text-amber-500">{totals.balanceCount} (₹{totals.balanceAmount.toLocaleString("en-IN")})</td>
                    <td className="p-2.5 border-r border-border">{totals.ptCount} (₹{totals.ptAmount.toLocaleString("en-IN")})</td>
                    <td className="p-2.5 border-r border-border text-center">{totals.consultation}</td>
                    <td className="p-2.5 border-r border-border text-center">{totals.measurement}</td>
                    <td className="p-2.5 border-r border-border text-[10px]">
                      E: {totals.enquiryCompleted} • P: {totals.paymentCompleted} • Ex: {totals.expiryCompleted}
                    </td>
                    <td className="p-2.5 border-r border-border text-right">₹{totals.cashTotal.toLocaleString("en-IN")}</td>
                    <td className="p-2.5 border-r border-border text-right">₹{totals.cardTotal.toLocaleString("en-IN")}</td>
                    <td className="p-2.5 border-r border-border text-right text-emerald-500">₹{totals.todayCollection.toLocaleString("en-IN")}</td>
                    <td className="p-2.5 border-r border-border text-center">{totals.attendance}</td>
                    <td className="p-2.5"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}