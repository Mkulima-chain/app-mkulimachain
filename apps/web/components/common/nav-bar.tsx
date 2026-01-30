"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavLogo } from "./nav/nav-logo";
import { HomeMenu } from "./nav/home-menu";
import { NavLinks } from "./nav/nav-links";
import { CartDropdown } from "./nav/cart-dropdown";
import { LanguageSelector } from "./nav/language-selector";
import { MobileMenu } from "./nav/mobile-menu";
import { UserAvatar } from "../user-avatar";
import { WalletPopover } from "./nav/wallet-popover";

export function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-[#004D73]/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLogo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <HomeMenu />
            <NavLinks />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <CartDropdown />
            <LanguageSelector />
            <ThemeToggle />

            <div className="hidden md:flex items-center gap-2">
              <WalletPopover />
              {/* <ConnectWallet /> */}
              <UserAvatar />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>
    </nav>
  );
}
