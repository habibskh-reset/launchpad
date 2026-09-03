import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { App } from "@/App";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AuthGuard } from "@/features/auth/AuthGuard";

const DashboardPage = lazy(() =>
  import("@/features/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);

const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
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
    <AuthGuard>
      <App />
    </AuthGuard>
  );
}

export const router = createBrowserRouter([
  {
    element: <ProtectedShell />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
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
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
