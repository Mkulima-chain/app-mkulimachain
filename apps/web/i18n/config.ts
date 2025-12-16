export const locales = ["ln", "kg", "sw", "lua", "fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ln";

export const localeNames: Record<Locale, string> = {
  ln: "Lingala",
  kg: "Chicongo",
  sw: "Kiswahili",
  lua: "TChiluba",
  fr: "Français",
  en: "Anglais",
};

export const localeFlags: Record<Locale, string> = {
  ln: "🇨🇩",
  kg: "🇨🇩",
  sw: "🇹🇿",
  lua: "🇨🇩",
  fr: "🇫🇷",
  en: "🇬🇧",
};
