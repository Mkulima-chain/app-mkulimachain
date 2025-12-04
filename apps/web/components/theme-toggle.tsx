"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  
  // Pendant le SSR, resolvedTheme est undefined
  // On utilise un état par défaut (light mode) pour éviter l'erreur d'hydratation
  // Le serveur et le client doivent rendre le même HTML initial
  const isDark = resolvedTheme === "dark"
  
  // Si resolvedTheme n'est pas encore disponible, on utilise un état neutre
  const showDark = resolvedTheme !== undefined ? isDark : false

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(showDark ? "light" : "dark")}
      className={cn(
        "w-9 h-9 rounded-lg transition-all duration-300",
        "hover:bg-[#3A8F4C]/10 dark:hover:bg-white/10",
        "text-[#5A3E36] dark:text-white/90",
        "hover:text-[#3A8F4C] dark:hover:text-white"
      )}
      aria-label={showDark ? "Passer au mode clair" : "Passer au mode sombre"}
    >
      {showDark ? (
        <Sun className="h-4 w-4 transition-all duration-300" />
      ) : (
        <Moon className="h-4 w-4 transition-all duration-300" />
      )}
    </Button>
  )
}

