"use client";

import { useState } from "react";
import { ChevronDown, Languages, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/icons";
import { translations } from "@/lib/fingerprint/presentation";
import type { Language, Translation } from "@/types/fingerprint";
import styles from "./header-hero.module.css";

interface SiteHeaderProps {
  language: Language;
  languageOpen: boolean;
  onSelectLanguage: (language: Language) => void;
  onToggleLanguage: () => void;
  translation: Translation;
}

interface NavigationItem {
  href: string;
  label: string;
}

const languageLabels: Record<Language, string> = {
  EN: translations.EN.languageName,
  VI: translations.VI.languageName,
  CN: translations.CN.languageName,
  RU: translations.RU.languageName,
};

const languageOptions = Object.keys(languageLabels) as Language[];

export function SiteHeader({
  language,
  languageOpen,
  onSelectLanguage,
  onToggleLanguage,
  translation,
}: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigation: NavigationItem[] = [
    { href: "https://hideproxy.io/", label: translation.navigation.proxy },
    { href: "https://hidemium.io/", label: translation.navigation.antidetectBrowser },
    { href: "https://t.me/hideproxyio", label: translation.navigation.contacts },
  ];

  const closeNavigation = () => {
    setMobileOpen(false);
  };

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerInner}>
        <a className={styles.brand} href="#top" aria-label="Fingerprint Checked home">
          <BrandMark className={styles.brandMark} />
          <span>Fingerprint Checked</span>
        </a>

        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {navigation.map((item) => (
            <a className={styles.navLink} href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.desktopActions}>
          <div
            className={styles.languagePicker}
            onBlur={(event) => {
              if (languageOpen && !event.currentTarget.contains(event.relatedTarget)) {
                onToggleLanguage();
              }
            }}
            onKeyDown={(event) => {
              if (languageOpen && event.key === "Escape") onToggleLanguage();
            }}
          >
            <button
              aria-expanded={languageOpen}
              aria-haspopup="menu"
              aria-label={translation.navigation.language}
              className={styles.languageButton}
              onClick={onToggleLanguage}
              type="button"
            >
              <Languages aria-hidden="true" size={14} />
              {language}
              <ChevronDown aria-hidden="true" size={12} />
            </button>
            <div
              aria-label={translation.navigation.language}
              className={styles.languageMenu}
              data-open={languageOpen}
              role="menu"
            >
              {languageOptions.map((option) => (
                <button
                  aria-checked={language === option}
                  className={styles.languageOption}
                  data-active={language === option}
                  key={option}
                  onClick={() => onSelectLanguage(option)}
                  role="menuitemradio"
                  type="button"
                >
                  <strong>{option}</strong>
                  <span>{languageLabels[option]}</span>
                </button>
              ))}
            </div>
          </div>
          <a className={styles.loginLink} href="#login">{translation.navigation.logIn}</a>
          <a className={styles.signupLink} href="#signup">{translation.navigation.signUp}</a>
        </div>

        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? translation.navigation.closeNavigation : translation.navigation.openNavigation}
          onClick={() => setMobileOpen((current) => !current)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div
        className={styles.mobilePanel}
        data-open={mobileOpen}
        id="mobile-navigation"
      >
        <nav aria-label="Mobile navigation">
          {navigation.map((item) => (
            <a className={styles.mobileDirectLink} href={item.href} key={item.href} onClick={closeNavigation}>
              {item.label}
            </a>
          ))}
          <div className={styles.mobileLanguage} aria-label={translation.navigation.language}>
            <span>{translation.navigation.language}</span>
            <div>
              {languageOptions.map((option) => (
                <button
                  aria-pressed={language === option}
                  data-active={language === option}
                  key={option}
                  onClick={() => {
                    onSelectLanguage(option);
                    closeNavigation();
                  }}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.mobileActions}>
            <a href="#login" onClick={closeNavigation}>{translation.navigation.logIn}</a>
            <a href="#signup" onClick={closeNavigation}>{translation.navigation.signUp}</a>
          </div>
        </nav>
      </div>
    </header>
  );
}
