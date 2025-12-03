import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MeshProviderComponent } from "@/components/providers/mesh-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mkulima Chain  - Marketplace décentralisée pour agriculteurs congolais",
  description:
    "Plateforme Cardano connectant directement les producteurs de cacao, café et manioc aux acheteurs internationaux. Traçabilité blockchain, paiements décentralisés, impact social.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange={false}
            storageKey="mkulima-chain-theme"
          >
            <MeshProviderComponent>
            {children}
              <Toaster />
            </MeshProviderComponent>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
