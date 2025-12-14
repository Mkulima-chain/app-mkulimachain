"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Éviter l'erreur d'hydratation en ne rendant le thème qu'après le montage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant le SSR et avant le montage, on rend toujours le même état (light mode)
  // Cela garantit que le serveur et le client rendent le même HTML initial
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "w-9 h-9 rounded-lg transition-all duration-300",
          "hover:bg-[#3A8F4C]/10 dark:hover:bg-white/10",
          "text-[#5A3E36] dark:text-white/90",
          "hover:text-[#3A8F4C] dark:hover:text-white"
        )}
        aria-label="Passer au mode sombre"
        suppressHydrationWarning
      >
        <Moon className="h-4 w-4 transition-all duration-300" />
      </Button>
    );
  }

  // Après le montage, on peut utiliser le thème réel
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "w-9 h-9 rounded-lg transition-all duration-300",
        "hover:bg-[#3A8F4C]/10 dark:hover:bg-white/10",
        "text-[#5A3E36] dark:text-white/90",
        "hover:text-[#3A8F4C] dark:hover:text-white"
      )}
      aria-label={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-all duration-300" />
      ) : (
        <Moon className="h-4 w-4 transition-all duration-300" />
      )}
    </Button>
  );
}
