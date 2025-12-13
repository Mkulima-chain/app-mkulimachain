"use client";

import { useEffect } from "react";

/**
 * Suppresses benign Eternl wallet extension errors that appear in the console.
 * These errors are internal to the extension and don't affect functionality.
 */
export function EternlErrorHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Filter out Eternl-specific errors
    const filterEternlErrors = (args: any[]) => {
      const message = args.join(" ");

      // Check if this is an Eternl DOM error
      if (
        typeof message === "string" &&
        (message.includes("dom:receive no data domId") ||
          message.includes(
            "chrome-extension://kmhcihpebfmpgmihbkipmjlmmioameka"
          ) ||
          (message.includes("onMessageHandlerEternlDOM") &&
            message.includes("dom.js")))
      ) {
        // Suppress this error - it's benign
        return true;
      }

      return false;
    };

    // Override console.error
    console.error = (...args: any[]) => {
      if (!filterEternlErrors(args)) {
        originalError.apply(console, args);
      }
    };

    // Override console.warn (some extensions use warn instead of error)
    console.warn = (...args: any[]) => {
      if (!filterEternlErrors(args)) {
        originalWarn.apply(console, args);
      }
    };

    // Cleanup: restore original console methods on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
