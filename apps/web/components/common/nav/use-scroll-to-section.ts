"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NAVBAR_HEIGHT } from "./nav-constants";

export function useScrollToSection() {
  const pathname = usePathname();
  const router = useRouter();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - NAVBAR_HEIGHT;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    onClose?: () => void
  ) => {
    e.preventDefault();
    const sectionId = href.split("#")[1];

    if (pathname === "/") {
      scrollToSection(sectionId);
    } else {
      router.push(`/#${sectionId}`);
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 300);
    }
    onClose?.();
  };

  // Gérer le scroll automatique au chargement si l'URL contient un hash
  useEffect(() => {
    if (pathname === "/" && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const sectionId = hash.substring(1);
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 100);
      }
    }
  }, [pathname]);

  return { handleSectionClick };
}
