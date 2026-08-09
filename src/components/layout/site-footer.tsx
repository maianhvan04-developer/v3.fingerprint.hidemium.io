"use client";

import { useState, type FormEvent, type MouseEvent } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { BrandMark } from "@/components/icons";
import { ComingSoonModal } from "@/components/ui/ComingSoonModal";
import { useI18n } from "@/lib/i18n";

const footerColumns = [
  {
    headingKey: "footer.solutions",
    links: ["fraudPrevention", "accountTakeover", "paymentProtection", "botDetection", "riskManagement"],
  },
  {
    headingKey: "footer.developers",
    links: ["apiDocumentation", "sdks", "codeSamples", "integrations", "changelog"],
  },
] as const;

const productLinks = [
  { href: "https://hidemium.io/", label: "Hidemium" },
  { href: "https://hideproxy.io/", label: "HideProxy" },
] as const;

const socialLinks = [
  { href: "https://www.facebook.com/Hidemium.AntidetectBrowser", label: "Facebook" },
  { href: "https://www.youtube.com/@antidetect_hidemium", label: "YouTube" },
  { href: "https://x.com/hidemiumapp", label: "X / Twitter" },
  { href: "https://www.linkedin.com/company/hidemium", label: "LinkedIn" },
  { href: "https://t.me/hidemium", label: "Telegram" },
  { href: "https://www.tiktok.com/@hidemium", label: "TikTok" },
] as const;

export function SiteFooter() {
  const { t } = useI18n();
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);

  const handleComingSoonClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setComingSoonModalOpen(true);
  };

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setComingSoonModalOpen(true);
  };

  return (
    <footer className="site-footer" data-scroll="fade-up" id="footer">
      <div className="footer-brand">
        <a className="brand-lockup" href="#top">
          <span className="brand-mark"><BrandMark /></span>
          <span>Fingerprint Analyzer</span>
        </a>
        <p>{t("footer.description")}</p>
        <a className="source-link" href="https://hidemium.io/" rel="noreferrer" target="_blank">
          {t("footer.methodology")} <ExternalLink aria-hidden="true" />
        </a>
      </div>

      <div className="footer-links">
        <div>
          <strong>{t("footer.product")}</strong>
          {productLinks.map((link) => (
            <a href={link.href} key={link.label} rel="noreferrer" target="_blank">{link.label}</a>
          ))}
        </div>
        {footerColumns.map((column) => (
          <div key={column.headingKey}>
            <strong>{t(column.headingKey)}</strong>
            {column.links.map((link) => (
              <a href="#details" key={link} onClick={handleComingSoonClick}>{t(`footer.${link}`)}</a>
            ))}
          </div>
        ))}
        <div>
          <strong>{t("footer.company")}</strong>
          {socialLinks.map((link) => (
            <a href={link.href} key={link.label} rel="noreferrer" target="_blank">{link.label}</a>
          ))}
        </div>
      </div>

      <div className="footer-newsletter">
        <strong>{t("footer.stayUpdated")}</strong>
        <p>{t("footer.newsletterDescription")}</p>
        <form onSubmit={handleNewsletterSubmit}>
          <input aria-label={t("footer.email")} placeholder={t("footer.emailPlaceholder")} type="email" />
          <button aria-label={t("footer.subscribe")} type="submit">
            <ArrowRight aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="footer-bottom">
        <span>{t("footer.copyright")}</span>
        <div>
          <a href="#footer" onClick={handleComingSoonClick}>{t("footer.privacyPolicy")}</a>
          <a href="#footer" onClick={handleComingSoonClick}>{t("footer.terms")}</a>
          <a href="#footer" onClick={handleComingSoonClick}>{t("footer.security")}</a>
        </div>
      </div>
      <ComingSoonModal
        actionLabel={t("common.close")}
        description={t("header.resources.comingSoonDescription")}
        onClose={() => setComingSoonModalOpen(false)}
        open={comingSoonModalOpen}
        title={t("header.resources.comingSoonToast")}
      />
    </footer>
  );
}
