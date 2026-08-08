"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import cn from "@/locales/cn.json";
import en from "@/locales/en.json";
import ru from "@/locales/ru.json";
import vi from "@/locales/vi.json";

export const locales = ["en", "vi", "cn", "ru"] as const;

export type Locale = (typeof locales)[number];
export type TranslateVariables = Record<string, string | number>;
export type Translate = (key: string, variables?: TranslateVariables) => string;

type Dictionary = Record<string, unknown>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
}

const dictionaries: Record<Locale, Dictionary> = { cn, en, ru, vi };
const localeStorageKey = "fingerprint-analyzer-locale";

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return locales.includes(value as Locale);
}

function browserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";

  const language = navigator.language.toLowerCase();
  if (language.startsWith("vi")) return "vi";
  if (language.startsWith("zh")) return "cn";
  if (language.startsWith("ru")) return "ru";
  return "en";
}

function readKey(dictionary: Dictionary, key: string): string | null {
  let current: unknown = dictionary;

  for (const segment of key.split(".")) {
    if (!current || typeof current !== "object" || !(segment in current)) return null;
    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === "string" ? current : null;
}

function interpolate(value: string, variables: TranslateVariables = {}) {
  return value.replace(/\{\{(\w+)\}\}/g, (match, name: string) => {
    const replacement = variables[name];
    return replacement === undefined ? match : String(replacement);
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState<Locale>("en");

  useEffect(() => {
    const restoreLocale = window.setTimeout(() => {
      const storedLocale = window.localStorage.getItem(localeStorageKey);
      updateLocale(isLocale(storedLocale) ? storedLocale : browserLocale());
    }, 0);

    return () => window.clearTimeout(restoreLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "cn" ? "zh-CN" : locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    updateLocale(nextLocale);
    window.localStorage.setItem(localeStorageKey, nextLocale);
  }, []);

  const t = useCallback<Translate>((key, variables) => {
    const value = readKey(dictionaries[locale], key)
      ?? readKey(dictionaries.en, key)
      ?? key;
    return interpolate(value, variables);
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}

const statusKeys: Record<string, string> = {
  blocked: "common.blocked",
  checking: "common.checking",
  detected: "common.detected",
  disabled: "common.disabled",
  enabled: "common.enabled",
  high: "common.high",
  limited: "common.limited",
  low: "common.low",
  moderate: "common.moderate",
  "no leak detected": "common.noLeak",
  none: "common.none",
  "not detected": "common.notDetected",
  possible: "common.possible",
  protected: "common.protected",
  unavailable: "common.unavailable",
  unknown: "common.unknown",
};

export function localizeStatus(value: string, t: Translate) {
  const normalized = value.trim().replace(/\.{3}|…/g, "").toLowerCase();
  const key = statusKeys[normalized];
  return key ? t(key) : value;
}
