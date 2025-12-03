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
      buttonPosition?: string;
    }> | null>(null);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // @ts-expect-error - Types peuvent ne pas être disponibles immédiatement après installation
    import("@tanstack/react-query-devtools")
      .then((mod) => {
        setDevtoolsComponent(() => mod.ReactQueryDevtools);
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

