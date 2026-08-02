type ClientErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type ErrorReportingHooks = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: ClientErrorOptions,
  ) => void;
};

// Plug in your own error-monitoring SDK (Sentry, Bugsnag, custom endpoint...)
// by setting `window.__errorReportingHooks` before this module runs, or just
// rely on the console.error fallback below.
declare global {
  interface Window {
    __errorReportingHooks?: ErrorReportingHooks;
  }
}

export function reportClientError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const fullContext = {
    source: "react_error_boundary",
    route: window.location.pathname,
    ...context,
  };

  if (window.__errorReportingHooks?.captureException) {
    window.__errorReportingHooks.captureException(error, fullContext, {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    });
    return;
  }

  console.error("[client error]", error, fullContext);
}
