"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  Coins,
  School,
  Network,
  Leaf,
  Store,
  Image,
  FileText,
  Settings,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type MenuItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[]; // Si défini, seuls ces rôles peuvent voir cet élément
};

const menuItems: MenuItem[] = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Agriculteurs",
    href: "/farmers",
    icon: Users,
    roles: ["admin"], // Seuls les admins peuvent voir la gestion des agriculteurs
  },
  {
    title: "Coopératives",
    href: "/cooperatives",
    icon: Network,
    roles: ["admin"], // Seuls les admins peuvent voir la gestion des coopératives
  },
  {
    title: "Produits",
    href: "/products",
    icon: Package,
  },
  {
    title: "Récoltes",
    href: "/harvest",
    icon: Leaf,
  },
  {
    title: "Lots",
    href: "/batch",
    icon: FileText,
  },
  {
    title: "Marketplace",
    href: "/marketplace",
    icon: Store,
  },
  {
    title: "Commandes",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "NFT",
    href: "/nft",
    icon: Image,
  },
  {
    title: "Finance",
    href: "/finance",
    icon: Coins,
    roles: ["admin"], // Seuls les admins peuvent voir la finance globale
  },
  {
    title: "Portefeuilles",
    href: "/wallet",
    icon: Wallet,
    roles: ["admin"], // Seuls les admins peuvent voir la gestion des portefeuilles
  },
  {
    title: "Chaîne d'approvisionnement",
    href: "/supply-chain",
    icon: Network,
  },
  {
    title: "Fonds scolaires",
    href: "/school-fund",
    icon: School,
    roles: ["admin"], // Seuls les admins peuvent voir les fonds scolaires
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: Settings,
    roles: ["admin"], // Seuls les admins peuvent voir les paramètres système
  },
  {
    title: "Administrateurs",
    href: "/admins",
    icon: Shield,
    roles: ["admin"], // Seuls les admins peuvent créer d'autres admins
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { user } = useAuth();
  const userRole = user?.role;

  // Filtrer les éléments du menu selon le rôle
  const filteredMenuItems = React.useMemo(() => {
    return menuItems.filter((item) => {
      // Si aucun rôle n'est spécifié, l'élément est accessible à tous
      if (!item.roles) {
        return true;
      }
      // Si des rôles sont spécifiés, vérifier que l'utilisateur a l'un de ces rôles
      return userRole && item.roles.includes(userRole);
    });
  }, [userRole]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 flex items-center justify-center rounded-lg bg-card border hover:bg-accent transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#3A8F4C] to-[#2E7D32]">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">Admin</span>
                <span className="text-xs text-muted-foreground">
                  Mkulima Chain
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#3A8F4C] text-white shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
              Version 1.0.0
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
