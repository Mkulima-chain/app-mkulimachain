"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_LINKS, HOME_SECTIONS } from "./nav-constants";
import { useScrollToSection } from "./use-scroll-to-section";
import { AuthMenu } from "@/components/auth-menu";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { handleSectionClick } = useScrollToSection();

  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t py-4 space-y-2">
      {/* Accueil */}
      <Link
        href="/"
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
          pathname === "/"
            ? "bg-[#3A8F4C]/10 text-[#3A8F4C] dark:bg-[#3A8F4C]/20 dark:text-[#3A8F4C]"
            : "text-[#5A3E36] dark:text-white/80 hover:bg-[#3A8F4C]/5"
        )}
      >
        Accueil
      </Link>

      {/* Sections de l'accueil */}
      {pathname === "/" && (
        <div className="pl-7 space-y-1">
          {HOME_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              onClick={(e) => handleSectionClick(e, section.href, onClose)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-[#5A3E36] dark:text-white/70 hover:bg-[#3A8F4C]/5 text-sm"
            >
              {section.label}
            </Link>
          ))}
        </div>
      )}

      {/* Marketplace et NFT */}
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href || pathname?.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "flex items-center px-4 py-2 rounded-lg transition-colors",
              isActive
                ? "bg-[#3A8F4C]/10 text-[#3A8F4C] dark:bg-[#3A8F4C]/20 dark:text-[#3A8F4C]"
                : "text-[#5A3E36] dark:text-white/80 hover:bg-[#3A8F4C]/5"
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <div className="pt-2 border-t">
        <AuthMenu />
      </div>
    </div>
  );
}
