"use client";
import { MeshProvider } from "@meshsdk/react";
// import "@meshsdk/react/styles.css";

interface MeshProviderProps {
  children: React.ReactNode;
}

export function MeshProviderComponent ({ children }: MeshProviderProps) {
  return (
    <MeshProvider>
      {children}
    </MeshProvider>
  );
}