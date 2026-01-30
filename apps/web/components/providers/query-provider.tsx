"use client";

import React, { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";

// Composant Devtools conditionnel
function Devtools() {
  // Import dynamique pour éviter les erreurs TypeScript si le package n'est pas encore reconnu
  const [DevtoolsComponent, setDevtoolsComponent] =
    useState<React.ComponentType<{
      initialIsOpen?: boolean;
      buttonPosition?:
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right";
    }> | null>(null);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    import("@tanstack/react-query-devtools")
      .then((mod) => {
        // ReactQueryDevtools est un composant valide
        setDevtoolsComponent(
          () =>
            mod.ReactQueryDevtools as React.ComponentType<{
              initialIsOpen?: boolean;
              buttonPosition?:
                | "top-left"
                | "top-right"
                | "bottom-left"
                | "bottom-right";
            }>
        );
      })
      .catch(() => {
        // Devtools non disponibles
      });
  }, []);

  if (process.env.NODE_ENV !== "development" || !DevtoolsComponent) {
    return null;
  }

  return (
    <DevtoolsComponent initialIsOpen={false} buttonPosition="bottom-right" />
  );
}

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provider React Query pour l'application
 *
 * Inclut:
 * - QueryClientProvider avec configuration optimisée
 * - React Query Devtools (uniquement en développement)
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Utiliser useState pour éviter la création d'une nouvelle instance
  // à chaque re-render en mode développement avec React Strict Mode
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
      <Devtools />
    </QueryClientProvider>
  );
}
