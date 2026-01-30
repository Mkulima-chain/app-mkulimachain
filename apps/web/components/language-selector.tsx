"use client";

import { useState, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const languages = [
  { code: "ln", name: "Mkulima Chain", flag: "🇨🇩" },
  { code: "kg", name: "Chicongo", flag: "🇨🇩" },
  { code: "sw", name: "Kiswahili", flag: "🇹🇿" },
  { code: "lua", name: "TChiluba", flag: "🇨🇩" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "Anglais", flag: "🇬🇧" },
];

export function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState("ln");
  const [isOpen, setIsOpen] = useState(false);

  // Charger la langue depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("preferred-language");
      if (
        savedLanguage &&
        languages.some((lang) => lang.code === savedLanguage)
      ) {
        setTimeout(() => {
          setSelectedLanguage(savedLanguage);
        }, 0);
      }
    }
  }, []);

  const currentLang =
    languages.find((lang) => lang.code === selectedLanguage) || languages[0];

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    setIsOpen(false);
    // TODO: Implement language change logic (i18n, context, etc.)
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-language", code);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 px-3 py-2 h-9 rounded-lg",
            "bg-background hover:bg-muted/50",
            "border-border hover:border-[#3A8F4C]/50",
            "text-[#5A3E36] dark:text-white/90",
            "hover:text-[#3A8F4C] dark:hover:text-[#3A8F4C]",
            "transition-all duration-200",
            "shadow-sm hover:shadow-md"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-5 rounded bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20">
              <span className="text-sm leading-none">{currentLang.flag}</span>
            </div>
            <span className="hidden sm:inline font-medium text-sm">
              {currentLang.code.toUpperCase()}
            </span>
            <Globe className="hidden md:block size-3.5 opacity-60" />
          </div>
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center size-10 rounded-lg bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20">
              <Globe className="size-5 text-[#3A8F4C] dark:text-[#3A8F4C]" />
            </div>
            <div>
              <DialogTitle className="text-[#5A3E36] dark:text-white text-xl">
                Choisir une langue
              </DialogTitle>
              <DialogDescription className="text-[#004D73] dark:text-white/70 text-sm mt-1">
                Sélectionnez votre langue préférée pour l&apos;interface
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2 max-h-[400px] overflow-y-auto">
          {languages.map((language) => {
            const isSelected = selectedLanguage === language.code;
            return (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={cn(
                  "group relative flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  isSelected
                    ? "border-[#3A8F4C] dark:border-[#3A8F4C] bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 shadow-sm"
                    : "border-[#004D73]/20 dark:border-white/20 hover:border-[#3A8F4C]/40 dark:hover:border-[#3A8F4C]/50 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center size-10 rounded-lg text-2xl transition-all",
                    isSelected && "scale-110"
                  )}
                >
                  {language.flag}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div
                    className={cn(
                      "font-semibold text-sm mb-0.5",
                      isSelected
                        ? "text-[#3A8F4C] dark:text-[#3A8F4C]"
                        : "text-[#5A3E36] dark:text-white/90"
                    )}
                  >
                    {language.name}
                  </div>
                  <div
                    className={cn(
                      "text-xs font-medium",
                      isSelected
                        ? "text-[#3A8F4C]/70 dark:text-[#3A8F4C]/80"
                        : "text-[#004D73]/60 dark:text-white/60"
                    )}
                  >
                    {language.code.toUpperCase()}
                  </div>
                </div>
                {isSelected && (
                  <div className="flex items-center justify-center size-6 rounded-full bg-[#3A8F4C] dark:bg-[#3A8F4C] text-white animate-in fade-in zoom-in duration-200">
                    <Check className="size-3.5" />
                  </div>
                )}
                {!isSelected && (
                  <div className="flex items-center justify-center size-6 rounded-full border border-border opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronDown className="size-3.5 opacity-40" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
