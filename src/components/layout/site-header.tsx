"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FocusEvent, type MouseEvent } from "react";
import {
  BookOpen,
  ChevronDown,
  Code2,
  Handshake,
  LayoutTemplate,
  Link2,
  Menu,
  MessageSquareText,
  Newspaper,
  PlayCircle,
  Rocket,
  Wrench,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/icons";
import { ComingSoonBadge } from "@/components/ui/ComingSoonBadge";
import { ComingSoonModal } from "@/components/ui/ComingSoonModal";
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

const products = [
  {
    href: "https://hidemium.io/",
    logo: "/images/hidemium-icon.png",
    name: "Hidemium",
  },
  {
    href: "https://hideproxy.io/",
    logo: "/images/hideproxy-icon.svg",
    name: "HideProxy",
  },
] as const;

const resourceSections = [
  {
    items: [
      { comingSoon: true, href: "#top", icon: Rocket, labelKey: "header.resources.getStarted" },
      { comingSoon: true, href: "#details", icon: BookOpen, labelKey: "header.resources.userGuide" },
    ],
    titleKey: "header.resources.quickGuide",
  },
  {
    items: [
      { comingSoon: true, href: "https://amiunique.org/faq", icon: MessageSquareText, labelKey: "header.resources.faq" },
      { comingSoon: true, href: "#details", icon: Newspaper, labelKey: "header.resources.articles" },
      { comingSoon: true, href: "#footer", icon: Handshake, labelKey: "header.resources.partners" },
    ],
    titleKey: "header.resources.support",
  },
] as const;

const developerItems = [
  { comingSoon: true, href: "#raw-data", icon: Code2, labelKey: "header.resources.developers" },
  { comingSoon: true, href: "#details", icon: Link2, labelKey: "header.resources.integration" },
  { comingSoon: true, href: "#details", icon: Wrench, labelKey: "header.resources.troubleshooting" },
] as const;

const functionItems = [
  { comingSoon: true, href: "#details", icon: LayoutTemplate, labelKey: "header.resources.templates" },
  { comingSoon: true, href: "#top", icon: PlayCircle, labelKey: "header.resources.demo" },
] as const;

export function SiteHeader({ onAnalyze, scanning }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [developerOpen, setDeveloperOpen] = useState(false);
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const productCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resourceCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const developerCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { locale, setLocale, t } = useI18n();

  useEffect(() => () => {
    if (productCloseTimer.current) {
      clearTimeout(productCloseTimer.current);
    }
    if (resourceCloseTimer.current) {
      clearTimeout(resourceCloseTimer.current);
    }
    if (developerCloseTimer.current) {
      clearTimeout(developerCloseTimer.current);
    }
  }, []);

  const selectLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setLocaleOpen(false);
  };

  const closeProductMenuOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setProductOpen(false);
    }
  };

  const closeResourceMenuOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setResourceOpen(false);
    }
  };

  const closeDeveloperMenuOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDeveloperOpen(false);
    }
  };

  const openProductMenu = () => {
    if (productCloseTimer.current) {
      clearTimeout(productCloseTimer.current);
      productCloseTimer.current = null;
    }
    setResourceOpen(false);
    setDeveloperOpen(false);
    setProductOpen(true);
  };

  const scheduleProductMenuClose = () => {
    if (productCloseTimer.current) {
      clearTimeout(productCloseTimer.current);
    }
    productCloseTimer.current = setTimeout(() => {
      setProductOpen(false);
      productCloseTimer.current = null;
    }, 220);
  };

  const openResourceMenu = () => {
    if (resourceCloseTimer.current) {
      clearTimeout(resourceCloseTimer.current);
      resourceCloseTimer.current = null;
    }
    setProductOpen(false);
    setDeveloperOpen(false);
    setResourceOpen(true);
  };

  const scheduleResourceMenuClose = () => {
    if (resourceCloseTimer.current) {
      clearTimeout(resourceCloseTimer.current);
    }
    resourceCloseTimer.current = setTimeout(() => {
      setResourceOpen(false);
      resourceCloseTimer.current = null;
    }, 220);
  };

  const openDeveloperMenu = () => {
    if (developerCloseTimer.current) {
      clearTimeout(developerCloseTimer.current);
      developerCloseTimer.current = null;
    }
    setProductOpen(false);
    setResourceOpen(false);
    setDeveloperOpen(true);
  };

  const scheduleDeveloperMenuClose = () => {
    if (developerCloseTimer.current) {
      clearTimeout(developerCloseTimer.current);
    }
    developerCloseTimer.current = setTimeout(() => {
      setDeveloperOpen(false);
      developerCloseTimer.current = null;
    }, 220);
  };

  const showComingSoonModal = () => setComingSoonModalOpen(true);

  const handleComingSoonClick = (
    event: MouseEvent<HTMLAnchorElement>,
    closeMenu: () => void,
  ) => {
    event.preventDefault();
    closeMenu();
    showComingSoonModal();
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
          <div
            className={productOpen ? "product-nav product-nav--open" : "product-nav"}
            onBlur={closeProductMenuOnBlur}
            onMouseEnter={openProductMenu}
            onMouseLeave={scheduleProductMenuClose}
          >
            <button
              aria-expanded={productOpen}
              aria-haspopup="true"
              className="product-trigger"
              onClick={() => setProductOpen((open) => !open)}
              type="button"
            >
              {t("header.product")} <ChevronDown aria-hidden="true" />
            </button>
            <div className="product-mega" role="menu">
              <div className="product-mega__inner">
                <div className="product-mega__grid">
                  {products.map((product) => (
                    <a
                      href={product.href}
                      key={product.name}
                      onClick={() => {
                        setProductOpen(false);
                        setMenuOpen(false);
                      }}
                      rel="noreferrer"
                      role="menuitem"
                      target="_blank"
                    >
                      <span className="product-logo">
                        <Image
                          alt=""
                          aria-hidden="true"
                          height={40}
                          src={product.logo}
                          width={40}
                        />
                      </span>
                      <strong>{product.name}</strong>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div
            className={resourceOpen ? "resources-nav resources-nav--open" : "resources-nav"}
            onBlur={closeResourceMenuOnBlur}
            onMouseEnter={openResourceMenu}
            onMouseLeave={scheduleResourceMenuClose}
          >
            <button
              aria-expanded={resourceOpen}
              aria-haspopup="true"
              className="resources-trigger"
              onClick={() => {
                setProductOpen(false);
                setDeveloperOpen(false);
                setResourceOpen((open) => !open);
              }}
              type="button"
            >
              {t("header.useCases")} <ChevronDown aria-hidden="true" />
            </button>
            <div className="resources-mega" role="menu">
              <div className="resources-mega__inner">
                {resourceSections.map((section) => (
                  <section className="resources-mega__section" key={section.titleKey}>
                    <h3>{t(section.titleKey)}</h3>
                    <div className="resources-mega__list">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isComingSoon = "comingSoon" in item && item.comingSoon;

                        return (
                          <a
                            href={item.href}
                            key={item.labelKey}
                            onClick={(event) => {
                              if (isComingSoon) {
                                handleComingSoonClick(event, () => {
                                  setResourceOpen(false);
                                  setMenuOpen(false);
                                });
                                return;
                              }
                              setResourceOpen(false);
                              setMenuOpen(false);
                            }}
                            rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                            role="menuitem"
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                          >
                            <Icon aria-hidden="true" />
                            <span>{t(item.labelKey)}</span>
                            {isComingSoon ? (
                              <ComingSoonBadge>{t("header.resources.comingSoon")}</ComingSoonBadge>
                            ) : null}
                          </a>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
          <div
            className={developerOpen ? "developers-nav developers-nav--open" : "developers-nav"}
            onBlur={closeDeveloperMenuOnBlur}
            onMouseEnter={openDeveloperMenu}
            onMouseLeave={scheduleDeveloperMenuClose}
          >
            <button
              aria-expanded={developerOpen}
              aria-haspopup="true"
              className="developers-trigger"
              onClick={() => {
                setProductOpen(false);
                setResourceOpen(false);
                setDeveloperOpen((open) => !open);
              }}
              type="button"
            >
              {t("header.developers")} <ChevronDown aria-hidden="true" />
            </button>
            <div className="developers-mega" role="menu">
              <div className="developers-mega__inner">
                {[
                  { items: developerItems, titleKey: "header.developers" },
                  { items: functionItems, titleKey: "header.resources.functions" },
                ].map((section) => (
                  <section className="developers-mega__section" key={section.titleKey}>
                    <h3>{t(section.titleKey)}</h3>
                    <div className="developers-mega__list">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isComingSoon = "comingSoon" in item && item.comingSoon;

                        return (
                          <a
                            href={item.href}
                            key={item.labelKey}
                            onClick={(event) => {
                              if (isComingSoon) {
                                handleComingSoonClick(event, () => {
                                  setDeveloperOpen(false);
                                  setMenuOpen(false);
                                });
                                return;
                              }
                              setDeveloperOpen(false);
                              setMenuOpen(false);
                            }}
                            role="menuitem"
                          >
                            <Icon aria-hidden="true" />
                            <span>{t(item.labelKey)}</span>
                            {isComingSoon ? (
                              <ComingSoonBadge>{t("header.resources.comingSoon")}</ComingSoonBadge>
                            ) : null}
                          </a>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
          <a
            href="https://amiunique.org/faq"
            onClick={(event) => handleComingSoonClick(event, () => setMenuOpen(false))}
            rel="noreferrer"
            target="_blank"
          >
            {t("header.docs")}
          </a>
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
      <ComingSoonModal
        actionLabel={t("common.close")}
        description={t("header.resources.comingSoonDescription")}
        onClose={() => setComingSoonModalOpen(false)}
        open={comingSoonModalOpen}
        title={t("header.resources.comingSoonToast")}
      />
    </header>
  );
}
