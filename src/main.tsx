import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { ThemeProvider } from "@/components/auth/ThemeToggle";
import { LoginOverlay } from "@/components/auth/LoginOverlay";
import { SecurityLockOverlay } from "@/components/auth/SecurityLockOverlay";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { router } from "@/router";
import "./index.css";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <LoginOverlay />
        <SecurityLockOverlay />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);