import {
  Cloud,
  Code2,
  Crosshair,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import styles from "./header-hero.module.css";

interface Partner {
  className: string;
  icon?: LucideIcon;
  iconSize?: number;
  name: string;
}

const partners: readonly Partner[] = [
  { className: styles.cloudflare, icon: Cloud, iconSize: 18, name: "Cloudflare" },
  { className: styles.akamai, name: "Akamai" },
  { className: styles.datadome, name: "DATADOME" },
  { className: styles.imperva, name: "imperva" },
  { className: styles.seon, icon: Crosshair, iconSize: 17, name: "SEON" },
  { className: styles.riskified, icon: ShieldCheck, iconSize: 16, name: "riskified" },
  { className: styles.appfuel, icon: Zap, iconSize: 16, name: "appfuel" },
];

const features = [
  {
    description: "Correlate 50+ signals for unmatched accuracy in visitor identification.",
    icon: Crosshair,
    title: "Highly Accurate",
  },
  {
    description: "50+ comprehensive signals in under a second via our global edge network.",
    icon: Zap,
    title: "Real-Time Analysis",
  },
  {
    description: "We process data responsibly and never store personal information.",
    icon: ShieldCheck,
    title: "Privacy Compliant",
  },
  {
    description: "Simple API, easy SDKs, and clear docs for fast integration.",
    icon: Code2,
    title: "Developer Friendly",
  },
];

function PartnerMarks({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div
      aria-hidden={duplicate ? true : undefined}
      aria-label={duplicate ? undefined : "Trusted partners"}
      className={styles.partnerMarks}
      role={duplicate ? undefined : "list"}
    >
      {partners.map((partner) => {
        const Icon = partner.icon;

        return (
          <span
            className={partner.className}
            key={partner.name}
            role={duplicate ? undefined : "listitem"}
          >
            {Icon ? <Icon aria-hidden="true" size={partner.iconSize} /> : null}
            {partner.name}
          </span>
        );
      })}
    </div>
  );
}

export function TrustFeatures() {
  return (
    <section className={styles.trustSection} aria-labelledby="trust-heading">
      <div className={styles.trustInner}>
        <h2 id="trust-heading">TRUSTED BY SECURITY-FOCUSED TEAMS WORLDWIDE</h2>
        <div
          aria-label="Trusted partner logos"
          className={styles.partnerScroller}
          tabIndex={0}
        >
          <div className={styles.partnerTrack}>
            <PartnerMarks />
            <PartnerMarks duplicate />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductFeatures() {
  return (
    <section className={styles.featureSection} aria-label="Product capabilities">
      <div className={styles.featureInner}>
        <div className={styles.featureGrid}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className={styles.featureCard} key={feature.title}>
                <span className={styles.featureIcon}><Icon aria-hidden="true" size={23} /></span>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
