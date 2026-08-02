"use client";

import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/icons";
import styles from "./header-hero.module.css";

interface DropdownItem {
  href: string;
  label: string;
}

interface NavigationItem {
  href?: string;
  items?: DropdownItem[];
  label: string;
}

const navigation: NavigationItem[] = [
  {
    label: "Product",
    items: [
      { href: "#analysis", label: "Fingerprint Analysis" },
      { href: "#overview", label: "Browser Signals" },
      { href: "#how-it-works", label: "How it works" },
    ],
  },
  {
    label: "Use Cases",
    items: [
      { href: "#overview", label: "Fraud prevention" },
      { href: "#overview", label: "Bot detection" },
      { href: "#overview", label: "Account protection" },
    ],
  },
  { href: "#documentation", label: "Docs" },
  { href: "#pricing", label: "Pricing" },
  {
    label: "Company",
    items: [
      { href: "#about", label: "About" },
      { href: "#customers", label: "Customers" },
      { href: "#contact", label: "Contact" },
    ],
  },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    setOpenDropdown((current) => (current === label ? null : label));
  };

  const closeNavigation = () => {
    setMobileOpen(false);
    setOpenDropdown(null);
  };

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerInner}>
        <a className={styles.brand} href="#top" aria-label="Fingerprint Checked home">
          <BrandMark className={styles.brandMark} />
          <span>Fingerprint Checked</span>
        </a>

        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {navigation.map((item) =>
            item.items ? (
              <div
                className={styles.navDropdown}
                key={item.label}
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setOpenDropdown(null);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setOpenDropdown(null);
                }}
              >
                <button
                  className={styles.navButton}
                  type="button"
                  aria-expanded={openDropdown === item.label}
                  aria-haspopup="menu"
                  onClick={() => toggleDropdown(item.label)}
                >
                  {item.label}
                  <ChevronDown aria-hidden="true" size={13} strokeWidth={2} />
                </button>
                <div
                  className={styles.dropdownPanel}
                  data-open={openDropdown === item.label}
                  role="menu"
                >
                  {item.items.map((dropdownItem) => (
                    <a
                      href={dropdownItem.href}
                      key={dropdownItem.label}
                      onClick={closeNavigation}
                      role="menuitem"
                    >
                      {dropdownItem.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a className={styles.navLink} href={item.href} key={item.label}>
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className={styles.desktopActions}>
          <a className={styles.loginLink} href="#login">Log in</a>
          <a className={styles.signupLink} href="#signup">Sign up</a>
        </div>

        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
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
          {navigation.map((item) =>
            item.items ? (
              <div className={styles.mobileGroup} key={item.label}>
                <button
                  type="button"
                  aria-expanded={openDropdown === item.label}
                  onClick={() => toggleDropdown(item.label)}
                >
                  {item.label}
                  <ChevronDown aria-hidden="true" size={15} />
                </button>
                <div
                  className={styles.mobileSubmenu}
                  data-open={openDropdown === item.label}
                >
                  {item.items.map((dropdownItem) => (
                    <a href={dropdownItem.href} key={dropdownItem.label} onClick={closeNavigation}>
                      {dropdownItem.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a className={styles.mobileDirectLink} href={item.href} key={item.label} onClick={closeNavigation}>
                {item.label}
              </a>
            ),
          )}
          <div className={styles.mobileActions}>
            <a href="#login" onClick={closeNavigation}>Log in</a>
            <a href="#signup" onClick={closeNavigation}>Sign up</a>
          </div>
        </nav>
      </div>
    </header>
  );
}
