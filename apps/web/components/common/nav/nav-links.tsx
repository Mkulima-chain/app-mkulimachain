"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "./nav-constants";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href || pathname?.startsWith(link.href + "/");
        return (
          <Link key={link.href} href={link.href}>
            <Button
              variant="ghost"
              className={cn(
                "h-9 px-4",
                isActive
                  ? "bg-[#3A8F4C]/10 text-[#3A8F4C] dark:bg-[#3A8F4C]/20 dark:text-[#3A8F4C]"
                  : "text-[#5A3E36] dark:text-white/80 hover:text-[#3A8F4C] dark:hover:text-white"
              )}
            >
              {link.label}
            </Button>
          </Link>
        );
      })}
    </>
  );
}
