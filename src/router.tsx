import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { App } from "@/App";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RouteErrorPage } from "@/pages/RouteErrorPage";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";

const DashboardPage = lazy(() =>
  import("@/pages/Dashboard").then((module) => ({
    default: module.DashboardPage,
  })),
);

const SettingsPage = lazy(() =>
  import("@/pages/Settings").then((module) => ({
    default: module.SettingsPage,
  })),
);

function PageFallback() {
  return (
    <main className="flex-1 max-w-5xl mx-auto w-full p-6 flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Loading…</div>
    </main>
  );
}

function ProtectedShell() {
  return (
    <AuthProvider>
      <AuthGuard>
        <App />
      </AuthGuard>
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <ProtectedShell />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "/dashboard",
        element: (
          <Suspense fallback={<PageFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "/settings",
        element: (
          <Suspense fallback={<PageFallback />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);