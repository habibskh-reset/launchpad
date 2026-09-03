import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { LoginOverlay } from "@/features/auth/LoginOverlay";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { router } from "@/router";
import "./index.css";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <LoginOverlay />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);