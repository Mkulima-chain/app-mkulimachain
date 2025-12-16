"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatedCounter } from "@/components/animated-counter";
import { FAQItem } from "@/components/faq-item";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#004D73]">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-[#003D5C]/30 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#3A8F4C]/5 dark:bg-[#3A8F4C]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#004D73]/5 dark:bg-white/5 rounded-full blur-3xl animate-pulse-slow animation-delay-500"></div>
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 rounded-full border border-[#3A8F4C]/20 dark:border-[#3A8F4C]/30">
                <span className="text-sm font-medium text-[#3A8F4C] dark:text-[#3A8F4C]">
                  Plateforme Blockchain pour Agriculteurs Congolais
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-[#5A3E36] dark:text-white leading-tight">
                Libérez le potentiel de{" "}
                <span className="text-[#3A8F4C] dark:text-[#3A8F4C]">
                  l&apos;agriculture congolaise
                </span>{" "}
                avec la blockchain Cardano
              </h1>
              <p className="text-xl text-[#004D73] dark:text-white/80 leading-relaxed">
                Connectez directement les producteurs de cacao, café et manioc
                aux acheteurs internationaux. Traçabilité certifiée, paiements
                décentralisés, et impact social durable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all"
                  >
                    Commencer maintenant
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#004D73] dark:border-white/30 text-[#004D73] dark:text-white/90 hover:bg-[#E3F2FD] dark:hover:bg-white/10 text-lg px-8 py-6 h-auto"
                  >
                    En savoir plus
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <AnimatedCounter
                    value={70}
                    suffix="%"
                    className="text-3xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C]"
                  />
                  <div className="text-sm text-[#5A3E36] dark:text-white/80">
                    Non bancarisés
                  </div>
                </div>
                <div>
                  <AnimatedCounter
                    value={40}
                    suffix="%"
                    className="text-3xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C]"
                  />
                  <div className="text-sm text-[#5A3E36] dark:text-white/80">
                    Revenus capturés
                  </div>
                </div>
                <div>
                  <AnimatedCounter
                    value={100}
                    suffix="%"
                    className="text-3xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C]"
                  />
                  <div className="text-sm text-[#5A3E36] dark:text-white/80">
                    Traçabilité
                  </div>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="relative z-10 bg-white dark:bg-[#003D5C] rounded-2xl shadow-2xl p-8 border border-[#004D73]/10 dark:border-white/10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-[#3A8F4C] dark:text-[#3A8F4C]"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-[#5A3E36] dark:text-white">
                        Traçabilité Blockchain
                      </div>
                      <div className="text-sm text-[#004D73] dark:text-white/70">
                        QR Code sur chaque sac
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#004D73]/10 dark:bg-white/10 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-[#004D73] dark:text-white/90"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-[#5A3E36] dark:text-white">
                        Paiements ADA
                      </div>
                      <div className="text-sm text-[#004D73] dark:text-white/70">
                        Micro-prêts décentralisés
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#F2C94C]/10 dark:bg-[#F2C94C]/20 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-[#F2C94C] dark:text-[#F2C94C]"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-[#5A3E36] dark:text-white">
                        Marketplace Directe
                      </div>
                      <div className="text-sm text-[#004D73] dark:text-white/70">
                        Producteurs → Acheteurs
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#004D73]"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#5A3E36] dark:text-white mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-xl text-[#004D73] dark:text-white/80 max-w-2xl mx-auto">
              Une plateforme complète pour transformer l&apos;agriculture
              congolaise
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-[#004D73]/10 dark:border-white/10 hover:shadow-xl transition-all hover:border-[#3A8F4C]/30 dark:hover:border-[#3A8F4C]/50 hover:scale-105 group">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 flex items-center justify-center mb-4 group-hover:bg-[#3A8F4C]/20 dark:group-hover:bg-[#3A8F4C]/30 group-hover:scale-110 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-[#3A8F4C] dark:text-[#3A8F4C] group-hover:text-[#2E7D32] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-[#5A3E36] dark:text-white">
                  Traçabilité Blockchain
                </CardTitle>
                <CardDescription className="text-[#004D73] dark:text-white/70">
                  QR code sur chaque sac de cacao, café ou manioc. Metadata
                  on-chain avec smart contracts Plutus pour une certification
                  irréfutable.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#004D73]/10 dark:border-white/10 hover:shadow-xl transition-all hover:border-[#3A8F4C]/30 dark:hover:border-[#3A8F4C]/50 hover:scale-105 group">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-[#004D73]/10 dark:bg-white/10 flex items-center justify-center mb-4 group-hover:bg-[#004D73]/20 dark:group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-[#004D73] dark:text-white/90 group-hover:text-[#003D5C] dark:group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                  </svg>
                </div>
                <CardTitle className="text-[#5A3E36] dark:text-white">
                  Inclusion Financière DeFi
                </CardTitle>
                <CardDescription className="text-[#004D73] dark:text-white/70">
                  Micro-prêts en ADA, proof-of-harvest, pools de liquidité
                  communautaires. Pont ADA ↔️ M-Pesa / Airtel Money pour les
                  non-bancarisés.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#004D73]/10 dark:border-white/10 hover:shadow-xl transition-all hover:border-[#3A8F4C]/30 dark:hover:border-[#3A8F4C]/50 hover:scale-105 group">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-[#F2C94C]/10 dark:bg-[#F2C94C]/20 flex items-center justify-center mb-4 group-hover:bg-[#F2C94C]/20 dark:group-hover:bg-[#F2C94C]/30 group-hover:scale-110 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-[#F2C94C] dark:text-[#F2C94C] group-hover:text-[#E6B844] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-[#5A3E36] dark:text-white">
                  Marketplace Internationale
                </CardTitle>
                <CardDescription className="text-[#004D73] dark:text-white/70">
                  Vente directe fermiers → acheteurs. Paiement instantané via
                  smart contracts. Plus d&apos;intermédiaires, plus de revenus
                  pour les producteurs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#004D73]/10 dark:border-white/10 hover:shadow-xl transition-all hover:border-[#3A8F4C]/30 dark:hover:border-[#3A8F4C]/50 hover:scale-105 group">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-[#5A3E36]/10 dark:bg-white/10 flex items-center justify-center mb-4 group-hover:bg-[#5A3E36]/20 dark:group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-[#5A3E36] dark:text-white/90 group-hover:text-[#4A332D] dark:group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <CardTitle className="text-[#5A3E36] dark:text-white">
                  NFT Culture Lingala
                </CardTitle>
                <CardDescription className="text-[#004D73] dark:text-white/70">
                  Recettes, contes, proverbes, chants en NFT CIP-25. Revenus
                  redistribués pour financer la scolarité des enfants.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#004D73]/10 dark:border-white/10 hover:shadow-xl transition-all hover:border-[#3A8F4C]/30 dark:hover:border-[#3A8F4C]/50 hover:scale-105 group">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 flex items-center justify-center mb-4 group-hover:bg-[#3A8F4C]/20 dark:group-hover:bg-[#3A8F4C]/30 group-hover:scale-110 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-[#3A8F4C] dark:text-[#3A8F4C] group-hover:text-[#2E7D32] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-[#5A3E36] dark:text-white">
                  Wallet Mobile Offline-First
                </CardTitle>
                <CardDescription className="text-[#004D73] dark:text-white/70">
                  Fonctionne même sans connexion internet. Idéal pour les zones
                  rurales de la RDC. Synchronisation automatique quand la
                  connexion revient.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#004D73]/10 dark:border-white/10 hover:shadow-xl transition-all hover:border-[#3A8F4C]/30 dark:hover:border-[#3A8F4C]/50 hover:scale-105 group">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-[#004D73]/10 dark:bg-white/10 flex items-center justify-center mb-4 group-hover:bg-[#004D73]/20 dark:group-hover:bg-white/20 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-[#004D73] dark:text-white/90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-[#5A3E36] dark:text-white">
                  Smart Contracts Plutus
                </CardTitle>
                <CardDescription className="text-[#004D73] dark:text-white/70">
                  Automatisation des paiements, vérification des récoltes,
                  gestion des contrats d&apos;achat. Sécurisé, transparent,
                  décentralisé.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-[#003D5C]/30"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#5A3E36] dark:text-white mb-6">
                Pourquoi Mkulima Chain ?
              </h2>
              <p className="text-lg text-[#004D73] dark:text-white/80 mb-6 leading-relaxed">
                En République Démocratique du Congo, 70% des ruraux sont non
                bancarisés. Les intermédiaires capturent jusqu&apos;à 40% des
                revenus des agriculteurs. Il n&apos;y a aucune traçabilité
                certifiée, et le patrimoine culturel lingala se perd.
              </p>
              <p className="text-lg text-[#004D73] dark:text-white/80 mb-8 leading-relaxed">
                Mkulima Chain utilise la blockchain Cardano pour créer un
                écosystème décentralisé qui redonne le pouvoir aux agriculteurs
                congolais, préserve leur culture, et crée un impact social
                durable.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#3A8F4C] flex items-center justify-center shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#5A3E36] dark:text-white mb-1">
                      Inclusion financière
                    </h3>
                    <p className="text-[#004D73] dark:text-white/70">
                      Accès aux micro-prêts en ADA pour les agriculteurs non
                      bancarisés
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#3A8F4C] flex items-center justify-center shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#5A3E36] dark:text-white mb-1">
                      Traçabilité certifiée
                    </h3>
                    <p className="text-[#004D73] dark:text-white/70">
                      Chaque produit est tracé de la récolte à l&apos;acheteur
                      final
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#3A8F4C] flex items-center justify-center shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#5A3E36] dark:text-white mb-1">
                      Préservation culturelle
                    </h3>
                    <p className="text-[#004D73] dark:text-white/70">
                      NFTs culturels pour préserver et valoriser le patrimoine
                      lingala
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-[#003D5C] rounded-2xl shadow-2xl p-8 border border-[#004D73]/10 dark:border-white/10">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C] mb-2">
                      70%
                    </div>
                    <div className="text-[#5A3E36] dark:text-white font-medium">
                      Non bancarisés en RDC
                    </div>
                  </div>
                  <div className="h-1 bg-[#E8F5E9] dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3A8F4C] dark:bg-[#3A8F4C] rounded-full"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-[#E8F5E9] dark:bg-[#3A8F4C]/20 rounded-lg">
                      <div className="text-2xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C]">
                        40%
                      </div>
                      <div className="text-sm text-[#5A3E36] dark:text-white/90">
                        Revenus capturés
                      </div>
                    </div>
                    <div className="text-center p-4 bg-[#E3F2FD] dark:bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-[#004D73] dark:text-white">
                        100%
                      </div>
                      <div className="text-sm text-[#5A3E36] dark:text-white/90">
                        Traçabilité
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section
        id="impact"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#004D73]"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#5A3E36] dark:text-white mb-4">
              Notre Impact
            </h2>
            <p className="text-xl text-[#004D73] dark:text-white/80 max-w-2xl mx-auto">
              Des résultats concrets pour les agriculteurs congolais
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-[#004D73]/10 dark:border-white/10 hover:shadow-xl transition-all hover:scale-105 hover:border-[#3A8F4C]/30 dark:hover:border-[#3A8F4C]/50">
              <CardContent className="pt-8">
                <AnimatedCounter
                  value={60}
                  prefix="+"
                  suffix="%"
                  className="text-5xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C] mb-4"
                />
                <h3 className="text-xl font-semibold text-[#5A3E36] dark:text-white mb-2">
                  Revenus des agriculteurs
                </h3>
                <p className="text-[#004D73] dark:text-white/70">
                  Grâce à la vente directe et l&apos;élimination des
                  intermédiaires
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-[#004D73]/10 dark:border-white/10 hover:shadow-xl transition-all hover:scale-105 hover:border-[#004D73]/30 dark:hover:border-white/30">
              <CardContent className="pt-8">
                <AnimatedCounter
                  value={100}
                  suffix="%"
                  className="text-5xl font-bold text-[#004D73] dark:text-white mb-4"
                />
                <h3 className="text-xl font-semibold text-[#5A3E36] dark:text-white mb-2">
                  Traçabilité certifiée
                </h3>
                <p className="text-[#004D73] dark:text-white/70">
                  Chaque produit tracé de la récolte à l&apos;acheteur final via
                  blockchain
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-[#004D73]/10 dark:border-white/10 hover:shadow-xl transition-all hover:scale-105 hover:border-[#F2C94C]/30 dark:hover:border-[#F2C94C]/50">
              <CardContent className="pt-8">
                <AnimatedCounter
                  value={500}
                  suffix="+"
                  className="text-5xl font-bold text-[#F2C94C] dark:text-[#F2C94C] mb-4"
                />
                <h3 className="text-xl font-semibold text-[#5A3E36] dark:text-white mb-2">
                  Enfants scolarisés
                </h3>
                <p className="text-[#004D73] dark:text-white/70">
                  Financés grâce aux revenus des NFTs culturels Lingala
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-[#003D5C]/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#5A3E36] dark:text-white mb-4">
              Témoignages
            </h2>
            <p className="text-xl text-[#004D73] dark:text-white/80 max-w-2xl mx-auto">
              Ce que disent nos agriculteurs et partenaires
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-[#004D73]/10 dark:border-white/10 hover:shadow-xl transition-all bg-white dark:bg-[#003D5C]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4 text-[#F2C94C] dark:text-[#F2C94C]">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#004D73] dark:text-white/80 mb-6 italic">
                  &quot;Grâce à Mkulima Chain , j&apos;ai pu vendre mon cacao
                  directement aux acheteurs internationaux. Mes revenus ont
                  augmenté de 60% !&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#3A8F4C]/20 dark:bg-[#3A8F4C]/30 flex items-center justify-center">
                    <span className="text-[#3A8F4C] dark:text-[#3A8F4C] font-bold">
                      JM
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#5A3E36] dark:text-white">
                      Jean Mukendi
                    </div>
                    <div className="text-sm text-[#004D73] dark:text-white/70">
                      Agriculteur, Bas-Congo
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#004D73]/10 dark:border-white/10 hover:shadow-xl transition-all bg-white dark:bg-[#003D5C]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4 text-[#F2C94C] dark:text-[#F2C94C]">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#004D73] dark:text-white/80 mb-6 italic">
                  &quot;La traçabilité blockchain m&apos;a permis de certifier
                  l&apos;origine de mon café. Mes clients internationaux font
                  maintenant confiance à mes produits.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#004D73]/20 dark:bg-white/10 flex items-center justify-center">
                    <span className="text-[#004D73] dark:text-white/90 font-bold">
                      MK
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#5A3E36] dark:text-white">
                      Marie Kabila
                    </div>
                    <div className="text-sm text-[#004D73] dark:text-white/70">
                      Productrice de café, Kivu
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#004D73]/10 dark:border-white/10 hover:shadow-xl transition-all bg-white dark:bg-[#003D5C]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4 text-[#F2C94C] dark:text-[#F2C94C]">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#004D73] dark:text-white/80 mb-6 italic">
                  &quot;Les micro-prêts en ADA m&apos;ont permis d&apos;acheter
                  de meilleurs équipements. Je peux maintenant produire plus et
                  mieux.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F2C94C]/20 dark:bg-[#F2C94C]/30 flex items-center justify-center">
                    <span className="text-[#F2C94C] dark:text-[#F2C94C] font-bold">
                      PK
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#5A3E36] dark:text-white">
                      Pierre Kasa
                    </div>
                    <div className="text-sm text-[#004D73] dark:text-white/70">
                      Agriculteur, Équateur
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#004D73]"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#5A3E36] dark:text-white mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-[#004D73] dark:text-white/80">
              Tout ce que vous devez savoir sur Mkulima Chain
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                question: "Comment fonctionne la traçabilité blockchain ?",
                answer:
                  "Chaque sac de cacao, café ou manioc reçoit un QR code unique lié à un smart contract Cardano. Les informations de récolte, transformation et transport sont enregistrées de manière immuable sur la blockchain.",
              },
              {
                question:
                  "Dois-je avoir un wallet Cardano pour utiliser la plateforme ?",
                answer:
                  "Oui, mais c&apos;est très simple ! Nous supportons tous les wallets Cardano populaires (Nami, Eternl, Lace). Vous pouvez créer un wallet en quelques minutes directement depuis la plateforme.",
              },
              {
                question: "Comment fonctionnent les micro-prêts en ADA ?",
                answer:
                  "Les agriculteurs peuvent demander des micro-prêts basés sur leur proof-of-harvest (preuve de récolte). Les prêts sont gérés par des smart contracts Plutus et remboursés automatiquement lors de la vente des produits.",
              },
              {
                question: "Qu&apos;est-ce que les NFTs culturels Lingala ?",
                answer:
                  "Ce sont des NFTs (CIP-25) qui préservent le patrimoine culturel congolais : recettes traditionnelles, contes, proverbes, chants. Les revenus de vente sont redistribués pour financer la scolarité des enfants d&apos;agriculteurs.",
              },
              {
                question: "La plateforme fonctionne-t-elle sans internet ?",
                answer:
                  "Oui ! Notre wallet mobile est conçu pour fonctionner en mode offline-first. Vous pouvez enregistrer vos transactions et les synchroniser automatiquement quand la connexion revient.",
              },
            ].map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#3A8F4C] dark:bg-[#3A8F4C]">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à transformer l&apos;agriculture congolaise ?
          </h2>
          <p className="text-xl text-white/90 dark:text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez la communauté des agriculteurs qui utilisent la blockchain
            pour créer un avenir meilleur
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white dark:bg-white text-[#3A8F4C] dark:text-[#3A8F4C] hover:bg-[#E8F5E9] dark:hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                Créer mon compte gratuitement
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 dark:border-white/30 hover:border-white dark:hover:border-white hover:bg-white/10 dark:hover:bg-white/10 text-white dark:text-white text-lg px-8 py-6 h-auto cursor-pointer"
              >
                J&apos;ai déjà un compte
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
