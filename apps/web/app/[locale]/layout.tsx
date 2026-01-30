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
import { AdaPriceProvider } from "@/components/ui/price-display";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Mkulima Chain - Marketplace décentralisée pour agriculteurs congolais",
    template: "%s | Mkulima Chain",
  },
  description:
    "Plateforme Cardano connectant directement les producteurs de cacao, café et manioc aux acheteurs internationaux. Traçabilité blockchain, paiements décentralisés, impact social.",
  keywords: [
    "agriculture congolaise",
    "blockchain Cardano",
    "marketplace décentralisée",
    "traçabilité blockchain",
    "cacao Congo",
    "café Congo",
    "manioc",
    "NFT culturel",
    "micro-prêts ADA",
    "agriculteurs RDC",
    "inclusion financière",
  ],
  authors: [{ name: "Mkulima Chain" }],
  creator: "Mkulima Chain",
  publisher: "Mkulima Chain",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://app.mkulimachain.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Mkulima Chain",
    title:
      "Mkulima Chain - Marketplace décentralisée pour agriculteurs congolais",
    description:
      "Plateforme Cardano connectant directement les producteurs de cacao, café et manioc aux acheteurs internationaux. Traçabilité blockchain, paiements décentralisés, impact social.",
    images: [
      {
        url: "/logo-mkulima.png",
        width: 1200,
        height: 630,
        alt: "Mkulima Chain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Mkulima Chain - Marketplace décentralisée pour agriculteurs congolais",
    description:
      "Plateforme Cardano connectant directement les producteurs de cacao, café et manioc aux acheteurs internationaux.",
    images: ["/logo-mkulima.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo-mkulima-leaf.png", sizes: "any" },
      { url: "/logo-mkulima-leaf.png", type: "image/png", sizes: "32x32" },
      { url: "/logo-mkulima-leaf.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/logo-mkulima-leaf.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo-mkulima-leaf.png",
  },
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
                <AdaPriceProvider>
                  <div
                    className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
                  >
                    <WalletAutoReconnect />
                    <NotificationListener />
                    <NavBar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                    <Toaster />
                  </div>
                </AdaPriceProvider>
              </MeshProviderComponent>
            </ThemeProvider>
          </SessionProvider>
        </WalletProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
