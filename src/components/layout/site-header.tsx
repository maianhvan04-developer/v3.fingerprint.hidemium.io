"use client";

import { useState } from "react";
import { ChevronDown, Fingerprint, Menu, X } from "lucide-react";

interface SiteHeaderProps {
  onAnalyze: () => void;
  scanning: boolean;
}

export function SiteHeader({ onAnalyze, scanning }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <a className="brand-lockup" href="#top" aria-label="Fingerprint Analyzer home">
          <span className="brand-mark"><Fingerprint aria-hidden="true" /></span>
          <span>Fingerprint Analyzer</span>
        </a>

        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="mobile-menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <nav className={menuOpen ? "top-nav top-nav--open" : "top-nav"}>
          <a href="#overview">Product <ChevronDown aria-hidden="true" /></a>
          <a href="#details">Use Cases <ChevronDown aria-hidden="true" /></a>
          <a href="#raw-data">Developers <ChevronDown aria-hidden="true" /></a>
          <a href="#details">Pricing</a>
          <a href="https://amiunique.org/faq" target="_blank" rel="noreferrer">Docs</a>
          <a href="#footer">Company <ChevronDown aria-hidden="true" /></a>
        </nav>

        <div className="header-actions">
          <span className="locale-control">EN <ChevronDown aria-hidden="true" /></span>
          <a className="login-link" href="#details">Log in</a>
          <button className="header-cta" disabled={scanning} onClick={onAnalyze} type="button">
            {scanning ? "Analyzing…" : "Analyze Now"}
          </button>
        </div>
      </div>
    </header>
  );
}
