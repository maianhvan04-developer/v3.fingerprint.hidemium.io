import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/icons";
import { translations } from "@/lib/fingerprint/presentation";
import type { Language } from "@/types/fingerprint";

interface SiteHeaderProps {
  language: Language;
  languageOpen: boolean;
  menuOpen: boolean;
  onSelectLanguage: (language: Language) => void;
  onToggleLanguage: () => void;
  onToggleMenu: () => void;
}

const languageLabels: Record<Language, string> = {
  EN: translations.EN.languageName,
  VI: translations.VI.languageName,
  CN: translations.CN.languageName,
  RU: translations.RU.languageName,
};

export function SiteHeader({
  language,
  languageOpen,
  menuOpen,
  onSelectLanguage,
  onToggleLanguage,
  onToggleMenu,
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Fingerprint Checked home">
        <BrandMark className="logo" />
        <span className="brand-name">Fingerprint Checked</span>
      </a>

      <Button
        aria-expanded={menuOpen}
        aria-label="Toggle navigation"
        className="menu-toggle"
        onClick={onToggleMenu}
      >
        <span /><span /><span />
      </Button>

      <nav className={menuOpen ? "site-nav site-nav-open" : "site-nav"}>
        <a href="https://hideproxy.io/">Proxy</a>
        <a href="https://hidemium.io/">Antidetect Browser <span aria-hidden="true">⌄</span></a>
        <a href="https://t.me/hideproxyio">Contacts</a>
      </nav>

      <div className="header-actions">
        <div className="language-picker">
          <Button aria-expanded={languageOpen} className="language-button" onClick={onToggleLanguage}>
            {language} <span aria-hidden="true">⌄</span>
          </Button>
          {languageOpen ? (
            <div className="language-menu">
              {(Object.keys(languageLabels) as Language[]).map((option) => (
                <Button
                  className={language === option ? "active" : ""}
                  key={option}
                  onClick={() => onSelectLanguage(option)}
                >
                  {languageLabels[option]}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
        <a className="login-button" href="https://t.me/hidemium">Log in</a>
        <a className="signup-button" href="https://t.me/hidemium">Sign up</a>
      </div>
    </header>
  );
}
