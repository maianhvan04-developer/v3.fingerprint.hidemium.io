import { CopyButton } from "@/components/ui/copy-button";
import type { CopyKind, IpLookupResponse, Translation } from "@/types/fingerprint";

interface IpHeroProps {
  browserScore: string;
  copied: CopyKind | null;
  flag: string;
  ipAddress: string;
  ipError: boolean;
  ipInfo: IpLookupResponse;
  ipLoading: boolean;
  onCopyIp: () => void;
  riskScore: number;
  text: Translation;
}

export function IpHero({
  browserScore,
  copied,
  flag,
  ipAddress,
  ipError,
  ipInfo,
  ipLoading,
  onCopyIp,
  riskScore,
  text,
}: IpHeroProps) {
  return (
    <section className="hero">
      <div className="eyebrow">📡 {text.badge}</div>
      {ipError ? (
        <div className="warning-banner">
          Live IP lookup is unavailable. Browser diagnostics are still running locally.
        </div>
      ) : null}
      <h1 className="ip-title">
        <span className="flag" aria-hidden="true">{flag}</span>
        <span>{text.myIp}</span>
        <span className={ipLoading ? "loading-text" : "ip-address"}>{ipAddress}</span>
        <CopyButton
          copied={copied === "ip"}
          copiedLabel={text.copied}
          disabled={!ipInfo.ip}
          label={text.copyIp}
          onClick={onCopyIp}
        />
      </h1>

      <div className="ip-family-row">
        <span className={ipInfo.type === "IPv6" ? "ip-family dimmed" : "ip-family"}>
          <b>IPv4</b>{ipInfo.type === "IPv6" ? "Not detected" : ipAddress}
        </span>
        <span className={ipInfo.type === "IPv6" ? "ip-family" : "ip-family dimmed"}>
          <b>IPv6</b>{ipInfo.type === "IPv6" ? ipAddress : "Not detected"}
        </span>
      </div>

      <p className="city-text">
        {ipLoading
          ? "Locating your connection…"
          : [ipInfo.city, ipInfo.region, ipInfo.country].filter(Boolean).join(", ") || "Location unavailable"}
      </p>

      <div className="score-row">
        <span className="score-pill">{text.browserScore} <b>{browserScore}</b></span>
        <span className="risk-pill" title="Heuristic based on publicly exposed proxy, VPN, Tor, and hosting signals">
          {text.ipRisk} <b>{riskScore} / 100</b>
          <span className="risk-bar">
            <span className={`risk-fill risk-fill-${riskScore > 60 ? "high" : riskScore > 30 ? "medium" : "low"}`} />
          </span>
        </span>
        <a className="view-link" href="#diagnostics">{text.details}</a>
      </div>
    </section>
  );
}
