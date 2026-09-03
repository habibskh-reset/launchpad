import type { FolderColor } from "@/types/workspace";

export const COLOR_CYCLE: FolderColor[] = [
  "amber",
  "emerald",
  "violet",
  "rose",
  "cyan",
  "blue",
];

const ACCENT: Record<FolderColor, string> = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
  blue: "bg-blue-500",
};

export function folderAccent(
  color: FolderColor | undefined,
  index: number,
): string {
  const c = color ?? COLOR_CYCLE[index % COLOR_CYCLE.length] ?? "amber";
  return ACCENT[c];
}
