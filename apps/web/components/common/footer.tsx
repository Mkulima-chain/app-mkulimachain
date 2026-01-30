"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ExternalLink,
  Mail,
  Github,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// Types and languages are now imported from i18n/config

// Footer Links Data
const footerLinks = {
  product: [
    { href: "/pricing", label: "Tarification", external: false },
    { href: "/changelog", label: "Changelog", external: true },
    { href: "/docs", label: "Documentation", external: true },
    { href: "/downloads", label: "Téléchargements", external: false },
  ],
  company: [
    { href: "/about", label: "À propos", external: true },
    { href: "/blog", label: "Blog", external: true },
    {
      href: "/careers",
      label: "Carrières",
      external: true,
      badge: "On recrute",
    },
    { href: "/sitemap", label: "Plan du site", external: false },
  ],
  resources: [
    { href: "/community", label: "Communauté", external: true },
    { href: "/support", label: "Aide & Support", external: true },
    {
      href: "/whats-new",
      label: "Nouveautés",
      external: true,
      badge: "Nouveau",
    },
    {
      href: "/delete-data",
      label: "Supprimer les données",
      external: false,
      warning: true,
    },
  ],
  developers: [
    { href: "/api", label: "API", external: true },
    { href: "/status", label: "Statut", external: true },
    { href: "https://github.com", label: "Github", external: true },
  ],
  products: [
    {
      href: "/marketplace",
      label: "Marketplace",
      external: true,
      badge: "Marketplace",
    },
    {
      href: "/supply-chain",
      label: "Supply Chain",
      external: true,
      badge: "Supply Chain",
    },
    {
      href: "/finance",
      label: "Finance",
      external: true,
      badge: "Finance",
    },
  ],
};

const socialLinks = [
  { href: "https://github.com", icon: Github, label: "GitHub" },
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
];

// Custom hook
function useLanguage() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-language", newLocale);
    }
  };

  const currentLang = {
    code: locale,
    name: localeNames[locale],
    flag: localeFlags[locale],
  };

  return {
    selectedLanguage: locale,
    currentLang,
    handleLanguageChange,
    mounted: true,
  };
}

// Components
function FooterTopSection() {
  return (
    <div className="border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Stay Tuned Section */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white/90">
              Restez informé:
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    name="platform"
                    defaultChecked
                    className="sr-only"
                  />
                  <div className="w-3 h-3 rounded-full border-2 border-white/30 group-hover:border-[#3A8F4C] transition-colors">
                    <div className="w-full h-full rounded-full bg-[#3A8F4C] scale-50"></div>
                  </div>
                </div>
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                  Tout
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input type="radio" name="platform" className="sr-only" />
                  <div className="w-3 h-3 rounded-full border-2 border-white/30 group-hover:border-white/50 transition-colors"></div>
                </div>
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                  Plateformes Ouvertes
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input type="radio" name="platform" className="sr-only" />
                  <div className="w-3 h-3 rounded-full border-2 border-white/30 group-hover:border-white/50 transition-colors"></div>
                </div>
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                  Plateformes Cloud
                </span>
              </label>
            </div>
          </div>

          {/* Email Signup */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                type="email"
                placeholder="mail@example.com"
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#3A8F4C] focus:ring-[#3A8F4C]"
              />
            </div>
            <Button className="bg-white text-[#004D73] hover:bg-white/90 transition-colors whitespace-nowrap">
              S&apos;inscrire →
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white/90">Social:</span>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#3A8F4C] flex items-center justify-center transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FooterLinkSection({
  title,
  links,
}: {
  title: string;
  links: Array<{
    href: string;
    label: string;
    external: boolean;
    badge?: string;
    warning?: boolean;
  }>;
}) {
  return (
    <div>
      <h3 className="font-bold text-sm mb-4 text-white">{title}</h3>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              target={link.external ? "_blank" : undefined}
              className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
            >
              {link.label}
              {link.external && <ExternalLink className="w-3 h-3" />}
              {link.badge && (
                <span className="ml-1 px-1.5 py-0.5 bg-[#3A8F4C] text-white text-[10px] font-semibold rounded">
                  {link.badge}
                </span>
              )}
              {link.warning && <span className="text-[#F2C94C]">⚠</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterMainLinks() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        <FooterLinkSection title="PRODUIT" links={footerLinks.product} />
        <FooterLinkSection title="ENTREPRISE" links={footerLinks.company} />
        <FooterLinkSection title="RESSOURCES" links={footerLinks.resources} />
        <FooterLinkSection
          title="DÉVELOPPEURS"
          links={footerLinks.developers}
        />
        <div>
          <ul className="space-y-3 text-sm mt-8 lg:mt-0">
            {footerLinks.products.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {link.label}
                  {link.external && <ExternalLink className="w-3 h-3" />}
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.5 bg-[#3A8F4C] text-white text-[10px] font-semibold rounded">
                      {link.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function FooterBottom({
  selectedLanguage,
  currentLang,
  handleLanguageChange,
  mounted,
}: {
  selectedLanguage: Locale;
  currentLang: { code: string; name: string; flag: string };
  handleLanguageChange: (code: Locale) => void;
  mounted: boolean;
}) {
  // Utiliser la langue par défaut pendant le rendu serveur pour éviter l'erreur d'hydratation
  const displayLang = mounted
    ? currentLang
    : { code: "ln", name: localeNames.ln, flag: localeFlags.ln };
  return (
    <div className="border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Legal Links */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3A8F4C] to-[#2E7D32] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <span className="text-lg font-bold">Mkulima Chain®</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/70">
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Conditions d&apos;utilisation
              </Link>
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Politique de confidentialité
              </Link>
              <Link
                href="/cookies"
                className="hover:text-white transition-colors"
              >
                Politique des cookies
              </Link>
            </div>
          </div>

          {/* Copyright & Controls */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <p className="text-sm text-white/70">
              Copyright © {new Date().getFullYear()}-présent Mkulima Chain.
              Tous droits réservés.
            </p>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/10 h-8"
                  >
                    <span className="text-lg">{displayLang.flag}</span>
                    <span className="text-sm hidden sm:inline">
                      {displayLang.name}
                    </span>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="space-y-1">
                    {locales.map((langCode) => (
                      <button
                        key={langCode}
                        onClick={() => handleLanguageChange(langCode)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                          selectedLanguage === langCode
                            ? "bg-gradient-to-r from-[#3A8F4C]/10 to-[#3A8F4C]/5 text-[#3A8F4C] font-semibold border border-[#3A8F4C]/20"
                            : "text-[#5A3E36] hover:bg-[#E8F5E9] hover:text-[#3A8F4C]"
                        }`}
                      >
                        <span className="text-lg">{localeFlags[langCode]}</span>
                        <span className="flex-1 text-left">
                          {localeNames[langCode]}
                        </span>
                        {selectedLanguage === langCode && (
                          <svg
                            className="w-4 h-4 text-[#3A8F4C]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function Footer() {
  const { selectedLanguage, currentLang, handleLanguageChange, mounted } =
    useLanguage();

  return (
    <footer className="bg-[#004D73] text-white">
      <FooterTopSection />
      <FooterMainLinks />
      <FooterBottom
        selectedLanguage={selectedLanguage}
        currentLang={currentLang}
        handleLanguageChange={handleLanguageChange}
        mounted={mounted}
      />
    </footer>
  );
}
