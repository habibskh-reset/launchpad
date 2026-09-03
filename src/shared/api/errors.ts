export type AppErrorCode =
  | "unauthenticated"
  | "permission"
  | "not_found"
  | "unavailable"
  | "unknown";

export interface AppError {
  code: AppErrorCode;
  message: string;
  cause?: unknown;
}

export function isAppError(value: unknown): value is AppError {
  if (!value || typeof value !== "object") return false;
  const rec = value as Record<string, unknown>;
  return (
    typeof rec.code === "string" &&
    typeof rec.message === "string" &&
    (rec.code === "unauthenticated" ||
      rec.code === "permission" ||
      rec.code === "not_found" ||
      rec.code === "unavailable" ||
      rec.code === "unknown")
  );
}

function getVendorCode(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null || !("code" in err)) {
    return undefined;
  }
  const code = (err as { code: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

function mapCode(vendorCode: string | undefined, message: string): AppErrorCode {
  const haystack = `${vendorCode ?? ""} ${message}`.toLowerCase();
  if (
    haystack.includes("unauthenticated") ||
    haystack.includes("auth/") ||
    haystack.includes("signed out")
  ) {
    return "unauthenticated";
  }
  if (
    haystack.includes("permission-denied") ||
    haystack.includes("permission") ||
    haystack.includes("forbidden")
  ) {
    return "permission";
  }
  if (haystack.includes("not-found") || haystack.includes("not found")) {
    return "not_found";
  }
  if (
    haystack.includes("unavailable") ||
    haystack.includes("network") ||
    haystack.includes("offline")
  ) {
    return "unavailable";
  }
  return "unknown";
}

export function toAppError(err: unknown): AppError {
  if (isAppError(err)) return err;
  const message = err instanceof Error ? err.message : String(err);
  return {
    code: mapCode(getVendorCode(err), message),
    message,
    cause: err,
  };
}

export function formatAppError(prefix: string, err: unknown): string {
  const mapped = toAppError(err);
  return `${prefix}: ${mapped.message}`;
}
