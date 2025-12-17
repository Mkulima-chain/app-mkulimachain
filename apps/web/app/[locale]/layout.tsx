import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MeshProviderComponent } from "@/components/providers/mesh-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { WalletAutoReconnect } from "@/components/providers/wallet-auto-reconnect";
import { Toaster } from "@/components/ui/sonner";
import { WalletProvider } from "@/wallet/wallet-provider";
import { NotificationListener } from "@/components/notification-listener";
import { NavBar } from "@/components/common/nav-bar";
import { Footer } from "@/components/common/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Mkulima Chain  - Marketplace décentralisée pour agriculteurs congolais",
  description:
    "Plateforme Cardano connectant directement les producteurs de cacao, café et manioc aux acheteurs internationaux. Traçabilité blockchain, paiements décentralisés, impact social.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  const isValidLocale = (routing.locales as readonly string[]).includes(locale);
  if (!isValidLocale) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <WalletProvider>
              <SessionProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem={false}
                  disableTransitionOnChange={false}
                  storageKey="mkulima-chain-theme"
                >
                  <MeshProviderComponent>
                    <WalletAutoReconnect />
                    <NotificationListener />
                    <NavBar />
                    {children}
                    <Footer />
                    <Toaster />
                  </MeshProviderComponent>
                </ThemeProvider>
              </SessionProvider>
            </WalletProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
