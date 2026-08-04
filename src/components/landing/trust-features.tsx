import {
  Cloud,
  Code2,
  Crosshair,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface Partner {
  className: string;
  icon?: LucideIcon;
  iconSize?: number;
  name: string;
}

const partners: readonly Partner[] = [
  { className: "hh-cloudflare", icon: Cloud, iconSize: 18, name: "Cloudflare" },
  { className: "hh-akamai", name: "Akamai" },
  { className: "hh-datadome", name: "DATADOME" },
  { className: "hh-imperva", name: "imperva" },
  { className: "hh-seon", icon: Crosshair, iconSize: 17, name: "SEON" },
  { className: "hh-riskified", icon: ShieldCheck, iconSize: 16, name: "riskified" },
  { className: "hh-appfuel", icon: Zap, iconSize: 16, name: "appfuel" },
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
      className="hh-partnerMarks"
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
    <section className="hh-trustSection" aria-labelledby="trust-heading">
      <div className="hh-trustInner">
        <h2 id="trust-heading">TRUSTED BY SECURITY-FOCUSED TEAMS WORLDWIDE</h2>
        <div
          aria-label="Trusted partner logos"
          className="hh-partnerScroller"
          tabIndex={0}
        >
          <div className="hh-partnerTrack">
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
    <section className="hh-featureSection" aria-label="Product capabilities">
      <div className="hh-featureInner">
        <div className="hh-featureGrid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="hh-featureCard" key={feature.title}>
                <span className="hh-featureIcon"><Icon aria-hidden="true" size={23} /></span>
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
