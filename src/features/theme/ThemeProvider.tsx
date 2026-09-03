import { type ReactNode } from "react";
import { useTheme } from "./useTheme";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useTheme();
  return <>{children}</>;
}
