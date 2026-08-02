import { Cloud, Code2, Crosshair, ShieldCheck, Zap } from "lucide-react";
import styles from "./header-hero.module.css";

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

export function TrustFeatures() {
  return (
    <section className={styles.trustSection} aria-labelledby="trust-heading">
      <div className={styles.trustInner}>
        <h2 id="trust-heading">TRUSTED BY SECURITY-FOCUSED TEAMS WORLDWIDE</h2>
        <div className={styles.partnerScroller}>
          <div className={styles.partnerMarks} aria-label="Trusted partners">
            <span className={styles.cloudflare}><Cloud aria-hidden="true" size={18} />Cloudflare</span>
            <span className={styles.akamai}>Akamai</span>
            <span className={styles.datadome}>DATADOME</span>
            <span className={styles.imperva}>imperva</span>
            <span className={styles.seon}><Crosshair aria-hidden="true" size={17} />SEON</span>
            <span className={styles.riskified}><ShieldCheck aria-hidden="true" size={16} />riskified</span>
            <span className={styles.appfuel}><Zap aria-hidden="true" size={16} />appfuel</span>
          </div>
        </div>

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
