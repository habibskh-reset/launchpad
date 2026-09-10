export interface StoredReport {
  id: string;
  date: string; // "01-09-2026"
  dayName: string; // "Tuesday"
  sortTimestamp: number;
  // Collection From breakdown
  newCount: number;
  newAmount: number;
  renewCount: number;
  renewAmount: number;
  balanceCount: number;
  balanceAmount: number;
  ptCount: number;
  ptAmount: number;
  otherCount: number;
  otherAmount: number;
  // Progress & Assessments
  consultation: number;
  measurement: number;
  // Follow-ups (Done / Completed only)
  enquiryCompleted: number;
  paymentCompleted: number;
  expiryCompleted: number;
  // Cash Flow & Footfall
  cashTotal: number;
  cardTotal: number;
  todayCollection: number;
  availableCash: number;
  attendance: number;
  rawText?: string;
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function safeInt(val: string | undefined | null): number {
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, "").trim();
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function extractCountAndAmount(line: string): { count: number; amount: number } {
  const countM = line.match(/Count\s*[:=-]?\s*(\d+)/i);
  const amtM = line.match(/Amount\s*[:=-]?\s*([\d,]+)/i);
  return {
    count: countM ? safeInt(countM[1]) : 0,
    amount: amtM ? safeInt(amtM[1]) : 0,
  };
}

export function parseGNReportText(text: string): Omit<StoredReport, "id" | "sortTimestamp"> | null {
  try {
    const lines = text.split(/\r?\n/);

    const dateMatch = text.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
    let day = 1, month = 1, year = 2026;

    if (dateMatch) {
      day = safeInt(dateMatch[1]);
      month = safeInt(dateMatch[2]);
      year = safeInt(dateMatch[3]);
    } else {
      const now = new Date();
      day = now.getDate();
      month = now.getMonth() + 1;
      year = now.getFullYear();
    }

    const dateStr = `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
    const jsDate = new Date(year, month - 1, day);
    const dayName = DAY_NAMES[jsDate.getDay()] || "";

    let newCount = 0, newAmount = 0;
    let renewCount = 0, renewAmount = 0;
    let balanceCount = 0, balanceAmount = 0;
    let ptCount = 0, ptAmount = 0;
    let otherCount = 0, otherAmount = 0;
    let consultation = 0, measurement = 0;
    let enquiryCompleted = 0;
    let paymentCompleted = 0;
    let expiryCompleted = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      // PT (Personal Training) - broad boundary match
      if (/(?:^|[-*•\s])\s*(?:PT|P\.T\.?|Personal\s*Training)\b/i.test(trimmed)) {
        const { count, amount } = extractCountAndAmount(trimmed);
        ptCount = count;
        ptAmount = amount;
      }
      // Renewals
      else if (/(?:^|[-*•\s])\s*(?:Renew|Renewal)\b/i.test(trimmed)) {
        const { count, amount } = extractCountAndAmount(trimmed);
        renewCount = count;
        renewAmount = amount;
      }
      // New Admissions
      else if (/(?:^|[-*•\s])\s*(?:New|Fresh)\b/i.test(trimmed)) {
        const { count, amount } = extractCountAndAmount(trimmed);
        newCount = count;
        newAmount = amount;
      }
      // Balance
      else if (/(?:^|[-*•\s])\s*Balance\b/i.test(trimmed)) {
        const { count, amount } = extractCountAndAmount(trimmed);
        balanceCount = count;
        balanceAmount = amount;
      }
      // Others
      else if (/(?:^|[-*•\s])\s*Other(?:s)?\b/i.test(trimmed)) {
        const { count, amount } = extractCountAndAmount(trimmed);
        otherCount = count;
        otherAmount = amount;
      }
      // Assessments
      else if (/Consultation/i.test(trimmed)) {
        const m = trimmed.match(/Count\s*[:=-]?\s*(\d+)/i);
        if (m) consultation = safeInt(m[1]);
      } else if (/Measurement/i.test(trimmed)) {
        const m = trimmed.match(/Count\s*[:=-]?\s*(\d+)/i);
        if (m) measurement = safeInt(m[1]);
      }
      // Follow-ups (Completed / Done count only)
      else if (/Enquiry/i.test(trimmed)) {
        const compM = trimmed.match(/Completed\s*[:=-]?\s*(\d+)/i);
        if (compM) enquiryCompleted = safeInt(compM[1]);
      } else if (/Payment/i.test(trimmed) && /Completed/i.test(trimmed)) {
        const compM = trimmed.match(/Completed\s*[:=-]?\s*(\d+)/i);
        if (compM) paymentCompleted = safeInt(compM[1]);
      } else if (/Expiry/i.test(trimmed)) {
        const compM = trimmed.match(/Completed\s*[:=-]?\s*(\d+)/i);
        if (compM) expiryCompleted = safeInt(compM[1]);
      }
    }

    const cashMatch = text.match(/Cash\s*Total\s*[:=-]?\s*([\d,]+)/i);
    const cardMatch = text.match(/Card\s*Total\s*[:=-]?\s*([\d,]+)/i);
    const todayCollMatch = text.match(/Today\s*Collection\s*[:=-]?\s*([\d,]+)/i);
    const availCashMatch = text.match(/Available\s*Cash\s*[:=-]?\s*([\d,]+)/i);
    const attMatch = text.match(/Attendance\s*[:=-]?\s*(\d+)/i);

    const cashTotal = safeInt(cashMatch?.[1]);
    const cardTotal = safeInt(cardMatch?.[1]);
    const todayCollection = todayCollMatch ? safeInt(todayCollMatch[1]) : cashTotal + cardTotal;

    // Auto-detect PT if omitted or missed in formatted line but present in collection difference
    const knownSum = newAmount + renewAmount + balanceAmount + otherAmount;
    if (ptAmount === 0 && todayCollection > knownSum) {
      ptAmount = todayCollection - knownSum;
      ptCount = ptCount || 1;
    }

    return {
      date: dateStr,
      dayName,
      newCount,
      newAmount,
      renewCount,
      renewAmount,
      balanceCount,
      balanceAmount,
      ptCount,
      ptAmount,
      otherCount,
      otherAmount,
      consultation,
      measurement,
      enquiryCompleted,
      paymentCompleted,
      expiryCompleted,
      cashTotal,
      cardTotal,
      todayCollection,
      availableCash: safeInt(availCashMatch?.[1]),
      attendance: safeInt(attMatch?.[1]),
      rawText: text,
    };
  } catch (err) {
    console.error("Parse error:", err);
    return null;
  }
}

export function getWorkWeekRange(date: Date): { startStr: string; endStr: string; label: string; key: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diffToMon));
  const sat = new Date(mon);
  sat.setDate(mon.getDate() + 5);

  const startStr = `${String(mon.getDate()).padStart(2, "0")} ${mon.toLocaleString("en-IN", { month: "short" })}`;
  const endStr = `${String(sat.getDate()).padStart(2, "0")} ${sat.toLocaleString("en-IN", { month: "short", year: "numeric" })}`;
  const key = `${mon.getFullYear()}-W${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`;

  return { startStr, endStr, label: `${startStr} – ${endStr}`, key };
}