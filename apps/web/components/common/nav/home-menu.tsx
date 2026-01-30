"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HOME_SECTIONS } from "./nav-constants";
import { useScrollToSection } from "./use-scroll-to-section";

export function HomeMenu() {
  const pathname = usePathname();
  const { handleSectionClick } = useScrollToSection();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "gap-2 h-9 px-4",
            pathname === "/"
              ? "bg-[#3A8F4C]/10 text-[#3A8F4C] dark:bg-[#3A8F4C]/20 dark:text-[#3A8F4C]"
              : "text-[#5A3E36] dark:text-white/80 hover:text-[#3A8F4C] dark:hover:text-white"
          )}
        >
          Accueil
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          {HOME_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              onClick={(e) => handleSectionClick(e, section.href)}
            >
              <Button
                variant="ghost"
                className="w-full justify-start h-9 text-sm"
              >
                {section.label}
              </Button>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
