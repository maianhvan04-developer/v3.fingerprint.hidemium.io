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
  EN: "English",
  VI: "Tiếng Việt",
  RU: "Русский",
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
        <span className="logo" aria-hidden="true">⚡</span>
        <span className="brand-name">Fingerprint Checked</span>
      </a>

      <button
        aria-expanded={menuOpen}
        aria-label="Toggle navigation"
        className="menu-toggle"
        onClick={onToggleMenu}
        type="button"
      >
        <span /><span /><span />
      </button>

      <nav className={menuOpen ? "site-nav site-nav-open" : "site-nav"}>
        <a href="https://hideproxy.io/">Proxy</a>
        <a href="https://hidemium.io/">Antidetect Browser <span aria-hidden="true">⌄</span></a>
        <a href="https://t.me/hideproxyio">Contacts</a>
      </nav>

      <div className="header-actions">
        <div className="language-picker">
          <button aria-expanded={languageOpen} className="language-button" onClick={onToggleLanguage} type="button">
            {language} <span aria-hidden="true">⌄</span>
          </button>
          {languageOpen ? (
            <div className="language-menu">
              {(Object.keys(languageLabels) as Language[]).map((option) => (
                <button
                  className={language === option ? "active" : ""}
                  key={option}
                  onClick={() => onSelectLanguage(option)}
                  type="button"
                >
                  {languageLabels[option]}
                </button>
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
