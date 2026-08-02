"use client";

import { useState } from "react";
import { AtSign, BriefcaseBusiness, Code2 } from "lucide-react";
import { BrandMark } from "@/components/icons";
import styles from "./overview-footer.module.css";

const footerGroups = [
  {
    links: ["Features", "Use Cases", "Pricing", "API", "Changelog"],
    title: "Product",
  },
  {
    links: ["Documentation", "Guides", "API Reference", "Blog", "Help Center"],
    title: "Resources",
  },
  {
    links: ["About", "Customers", "Partners", "Careers", "Contact"],
    title: "Company",
  },
] as const;

export function SiteFooter() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <a href="#top" aria-label="Fingerprint Checked home">
              <BrandMark />
              <strong>Fingerprint Checked</strong>
            </a>
            <p>Accurate. Real-time. Privacy first.<br />Anti-fraud you can trust.</p>
          </div>

          {footerGroups.map((group) => (
            <nav className={styles.footerGroup} aria-label={group.title} key={group.title}>
              <h2>{group.title}</h2>
              {group.links.map((link) => (
                <a href={`#${link.toLowerCase().replaceAll(" ", "-")}`} key={link}>{link}</a>
              ))}
            </nav>
          ))}

          <div className={styles.newsletter}>
            <h2>Stay updated</h2>
            <p>Get the latest product updates and fraud insights.</p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSubscribed(true);
              }}
            >
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input
                disabled={subscribed}
                id="newsletter-email"
                placeholder="Enter your email"
                required
                type="email"
              />
              <button disabled={subscribed} type="submit">
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </form>
            <div className={styles.socials} aria-label="Social media links">
              <a aria-label="Fingerprint Checked on X" href="https://x.com/">
                <AtSign aria-hidden="true" />
              </a>
              <a aria-label="Fingerprint Checked on LinkedIn" href="https://www.linkedin.com/">
                <BriefcaseBusiness aria-hidden="true" />
              </a>
              <a aria-label="Fingerprint Checked on GitHub" href="https://github.com/">
                <Code2 aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.legal}>
          <p>© 2026 Fingerprint Checked. All rights reserved.</p>
          <nav aria-label="Legal links">
            <a href="#privacy-policy">Privacy Policy</a>
            <a href="#terms-of-service">Terms of Service</a>
            <a href="#cookie-policy">Cookie Policy</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
