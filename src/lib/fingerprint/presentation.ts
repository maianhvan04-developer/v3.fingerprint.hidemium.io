import cn from "@locales/cn.json";
import en from "@locales/en.json";
import ru from "@locales/ru.json";
import vi from "@locales/vi.json";
import type { Language, Translation } from "@/types/fingerprint";

export const translations: Record<Language, Translation> = {
  CN: cn,
  EN: en,
  RU: ru,
  VI: vi,
};

export function getFlag(countryCode?: string) {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  return countryCode
    .toUpperCase()
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}
