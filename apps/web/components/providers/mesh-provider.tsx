"use client";

import { ReactNode } from "react";

interface LucidProviderProps {
  children: ReactNode;
}

/**
 * Provider component for Lucid-Cardano wallet.
 * The actual wallet state is managed via Jotai atoms in lib/wallet.ts
 * This component just provides a wrapper for consistency.
 */
export function LucidProviderComponent({ children }: LucidProviderProps) {
  return <>{children}</>;
}

// Legacy export for backward compatibility
export { LucidProviderComponent as MeshProviderComponent };
