"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";

interface LanguageSelectorProps {
  variant?: "default" | "ghost";
  size?: "sm" | "default" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function LanguageSelector({
  variant = "ghost",
  size = "icon",
  showLabel = false,
  className,
}: LanguageSelectorProps) {
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            "flex items-center gap-2",
            size === "icon" && "h-9 w-9",
            className
          )}
        >
          <span className="text-lg">{currentLang.flag}</span>
          {showLabel && (
            <span className="text-sm hidden sm:inline">{currentLang.name}</span>
          )}
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
            <Button
              key={langCode}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-9",
                locale === langCode &&
                  "bg-[#3A8F4C]/10 text-[#3A8F4C] dark:bg-[#3A8F4C]/20 dark:text-[#3A8F4C]"
              )}
              onClick={() => handleLanguageChange(langCode)}
            >
              <span className="text-lg">{localeFlags[langCode]}</span>
              <span className="text-sm">{localeNames[langCode]}</span>
              {locale === langCode && (
                <svg
                  className="w-4 h-4 ml-auto text-[#3A8F4C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
