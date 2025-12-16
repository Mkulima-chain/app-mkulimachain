export interface NavLink {
  href: string;
  label: string;
}

export interface HomeSection {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/marketplace/nft", label: "NFT" },
];

export const HOME_SECTIONS: HomeSection[] = [
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#about", label: "À propos" },
  { href: "/#impact", label: "Impact" },
  { href: "/#faq", label: "FAQ" },
];

export const CART_STORAGE_KEY = "mkulima-cart";
export const NAVBAR_HEIGHT = 64; // h-16 = 64px
