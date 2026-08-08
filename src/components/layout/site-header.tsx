"use client";

import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/icons";
import { locales, useI18n, type Locale } from "@/lib/i18n";

interface SiteHeaderProps {
  onAnalyze: () => void;
  scanning: boolean;
}

const localeNames: Record<Locale, string> = {
  cn: "中文",
  en: "English",
  ru: "Русский",
  vi: "Tiếng Việt",
};

export function SiteHeader({ onAnalyze, scanning }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();

  const selectLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setLocaleOpen(false);
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <a className="brand-lockup" href="#top" aria-label={t("header.home")}>
          <span className="brand-mark"><BrandMark /></span>
          <span>Fingerprint Analyzer</span>
        </a>

        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? t("header.closeNavigation") : t("header.openNavigation")}
          className="mobile-menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <nav className={menuOpen ? "top-nav top-nav--open" : "top-nav"}>
          <a href="#overview">{t("header.product")} <ChevronDown aria-hidden="true" /></a>
          <a href="#details">{t("header.useCases")} <ChevronDown aria-hidden="true" /></a>
          <a href="#raw-data">{t("header.developers")} <ChevronDown aria-hidden="true" /></a>
          <a href="#details">{t("header.pricing")}</a>
          <a href="https://amiunique.org/faq" target="_blank" rel="noreferrer">{t("header.docs")}</a>
          <a href="#footer">{t("header.company")} <ChevronDown aria-hidden="true" /></a>
          <label className="mobile-locale-select">
            <span>{t("header.language")}</span>
            <select
              aria-label={t("header.language")}
              onChange={(event) => selectLocale(event.target.value as Locale)}
              value={locale}
            >
              {locales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}
            </select>
          </label>
        </nav>

        <div className="header-actions">
          <div className="locale-picker">
            <button
              aria-expanded={localeOpen}
              aria-haspopup="listbox"
              aria-label={t("header.language")}
              className="locale-control"
              onClick={() => setLocaleOpen((open) => !open)}
              type="button"
            >
              {locale.toUpperCase()} <ChevronDown aria-hidden="true" />
            </button>
            {localeOpen ? (
              <div aria-label={t("header.language")} className="locale-menu" role="listbox">
                {locales.map((item) => (
                  <button
                    aria-selected={locale === item}
                    className={locale === item ? "is-active" : undefined}
                    key={item}
                    onClick={() => selectLocale(item)}
                    role="option"
                    type="button"
                  >
                    <span>{item.toUpperCase()}</span>{localeNames[item]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <a className="login-link" href="#details">{t("header.login")}</a>
          <button className="header-cta" disabled={scanning} onClick={onAnalyze} type="button">
            {scanning ? t("common.analyzing") : t("header.analyze")}
          </button>
        </div>
      </div>
    </header>
  );
}
