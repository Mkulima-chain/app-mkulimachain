"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const languages = [
  { code: "ln", name: "Lingala", flag: "🇨🇩" },
  { code: "kg", name: "Chicongo", flag: "🇨🇩" },
  { code: "sw", name: "Kiswahili", flag: "🇹🇿" },
  { code: "lua", name: "TChiluba", flag: "🇨🇩" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "Anglais", flag: "🇬🇧" },
]

export function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState("ln")
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = languages.find((lang) => lang.code === selectedLanguage) || languages[0]

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code)
    setIsOpen(false)
    // TODO: Implement language change logic (i18n, context, etc.)
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-language", code)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-[#5A3E36] hover:text-[#3A8F4C] transition-colors"
        >
          <span className="text-lg">{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#5A3E36]">Choisir une langue</DialogTitle>
          <DialogDescription className="text-[#004D73]">
            Sélectionnez votre langue préférée
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                selectedLanguage === language.code
                  ? "border-[#3A8F4C] bg-[#3A8F4C]/10 text-[#3A8F4C]"
                  : "border-[#004D73]/20 hover:border-[#3A8F4C]/30 hover:bg-[#E8F5E9] text-[#5A3E36]"
              }`}
            >
              <span className="text-2xl">{language.flag}</span>
              <div className="text-left">
                <div className="font-semibold">{language.name}</div>
                <div className="text-xs opacity-70">{language.code.toUpperCase()}</div>
              </div>
              {selectedLanguage === language.code && (
                <svg
                  className="w-5 h-5 ml-auto text-[#3A8F4C]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

