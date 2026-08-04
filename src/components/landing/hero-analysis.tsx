"use client";

import {
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  FileText,
  Globe2,
  Laptop,
  Network,
  RadioTower,
  Server,
  ShieldCheck,
} from "lucide-react";
import { ArrowRightMini, DottedField } from "@/components/icons";
import type {
  BrowserProfile,
  CopyKind,
  IpLookupResponse,
  WebRtcResult,
} from "@/types/fingerprint";

export interface HeroAnalysisProps {
  browser: BrowserProfile;
  browserScore: number | string;
  copied: CopyKind | null;
  ipAddress: string;
  ipInfo: IpLookupResponse;
  localTime: string;
  onCopyIp: () => Promise<void> | void;
  riskScore: number;
  webRtc: WebRtcResult;
}

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  tone?: "good" | "neutral" | "warning";
  truncate?: boolean;
  value: string;
  wide?: boolean;
}

function countryFlag(countryCode?: string) {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  return countryCode
    .toUpperCase()
    .split("")
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join("");
}

function readable(value: string | undefined, fallback = "Detecting…") {
  if (!value || value === "Unknown") return fallback;
  return value;
}

function normalizeProvider(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isPublicAddress(address: string) {
  const normalized = address.toLowerCase();
  if (normalized.endsWith(".local")) return false;
  if (normalized.includes(":")) return !/^(::1|fe80:|fc|fd)/i.test(normalized);
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalized)) return false;
  return !/^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(normalized);
}

function SummaryRow({
  icon,
  label,
  tone = "neutral",
  truncate = false,
  value,
  wide = false,
}: SummaryRowProps) {
  return (
    <div
      className="hh-summaryRow"
      data-truncate={truncate || undefined}
      data-wide={wide || undefined}
    >
      <span className="hh-summaryIcon" data-tone={tone}>{icon}</span>
      <span className="hh-summaryLabel">{label}</span>
      <span className="hh-summaryValue" data-tone={tone} title={truncate ? value : undefined}>{value}</span>
    </div>
  );
}

export function HeroAnalysis({
  browser,
  browserScore,
  copied,
  ipAddress,
  ipInfo,
  localTime,
  onCopyIp,
  riskScore,
  webRtc,
}: HeroAnalysisProps) {
  const flag = ipInfo.flag?.emoji || countryFlag(ipInfo.country_code);
  const location = [ipInfo.city, ipInfo.region, ipInfo.country].filter(Boolean).join(", ") || "Detecting location…";
  const provider = Array.from(new Set([
    ipInfo.connection?.isp,
    ipInfo.connection?.org,
  ].filter((value): value is string => Boolean(value)))).join(" · ") || "Detecting provider…";
  const providerNames = [ipInfo.connection?.isp, ipInfo.connection?.org]
    .filter((value): value is string => Boolean(value));
  const normalizedProviders = providerNames.map(normalizeProvider);
  const providerMismatch = normalizedProviders.length > 1 &&
    !normalizedProviders.some((value, index) => normalizedProviders.some((otherValue, otherIndex) =>
      index !== otherIndex && (value.includes(otherValue) || otherValue.includes(value)),
    ));
  const cloudProviderPattern = /amazon|aws|azure|cloudflare|digitalocean|google cloud|hetzner|linode|oracle|ovh|vultr/i;
  const normalizedRisk = Math.max(0, Math.min(100, Math.round(riskScore)));
  const securityEvaluated = Boolean(ipInfo.success || ipInfo.ip || providerNames.length);
  const isProxy = Boolean(
    ipInfo.security?.anonymous
    || ipInfo.security?.proxy
    || ipInfo.security?.vpn
    || ipInfo.security?.tor,
  ) ||
    (securityEvaluated && normalizedRisk >= 80);
  const isCloud = Boolean(ipInfo.security?.hosting) || providerNames.some((value) => cloudProviderPattern.test(value));
  const publicWebRtcIps = webRtc.ips.filter(isPublicAddress);
  const referenceIps = new Set([ipInfo.ip, ipInfo.ipv4, ipInfo.ipv6].filter(Boolean));
  const unexpectedWebRtcIp = publicWebRtcIps.some((address) => !referenceIps.has(address));
  const webRtcStatus = webRtc.status === "checking"
    ? "Checking"
    : webRtc.status === "unavailable" ? "Unavailable" : unexpectedWebRtcIp ? "Review" : "No leak";
  const browserLabel = [readable(browser.browser), browser.browserVersion]
    .filter((part) => part && part !== "Unknown")
    .join(" ");
  const riskLevel = String(Math.round(normalizedRisk / 10));
  const ipv4Address = ipInfo.ipv4 || (ipInfo.ip && !ipInfo.ip.includes(":") ? ipInfo.ip : undefined);
  const ipv6Address = ipInfo.ipv6 || (ipInfo.ip?.includes(":") ? ipInfo.ip : undefined);
  const publicWebRtcIpv4 = publicWebRtcIps.filter((address) => !address.includes(":"));
  const webRtcAddress = (addresses: string[]) => {
    if (webRtc.status === "checking") return "Detecting…";
    if (addresses.length) return addresses.join(", ");
    return webRtc.status === "complete" ? "— · no leak" : "Unavailable";
  };
  const releaseChannel = browser.browserVersion
    ? /beta|dev|canary|nightly/i.test(browser.userAgent)
      ? "Pre-release · UA-reported"
      : "Stable · UA-reported"
    : "Detecting…";
  const tcpTtl = browser.os === "Windows"
    ? "TTL≈128"
    : browser.os === "Linux" || browser.os === "macOS" || browser.os === "iOS"
      ? "TTL≈64"
      : "TTL unknown";
  const tcpFingerprint = `${readable(browser.os)} · ${tcpTtl} heuristic · MSS requires server SYN`;
  const organization = ipInfo.connection?.org || ipInfo.connection?.isp || "Detecting…";
  const asNumber = ipInfo.connection?.asn ? `AS${ipInfo.connection.asn}` : "Detecting…";
  const timeZone = readable(ipInfo.timezone?.id || browser.timezone);
  const riskChecks = securityEvaluated
    ? `Fake ISP: ${providerMismatch ? "Review" : "No"} · Anonymizer: ${isProxy ? "Detected" : "No"} · Cloud: ${isCloud ? "Yes" : "No"}`
    : "Not evaluated";
  const locationSummary = [
    ipInfo.city,
    ipInfo.region,
    ipInfo.country_code || ipInfo.country,
    ipInfo.postal,
  ].filter(Boolean).join(", ") || "Detecting…";
  const deviceIdentity = [readable(browser.device), readable(browser.architecture)]
    .filter(Boolean)
    .join(" · ");
  const browserIdentity = [browserLabel, readable(browser.engine), releaseChannel]
    .filter(Boolean)
    .join(" · ");
  const systemIdentity = [
    `${readable(browser.os)} ${readable(browser.osVersion)}`,
    deviceIdentity,
    readable(browser.platform),
  ].filter(Boolean).join(" · ");
  const webRtcSummary = `${webRtcAddress(publicWebRtcIpv4)} · ${webRtcStatus}`;
  const networkOwner = `${organization} · ${asNumber}`;
  const localTimeSummary = `${localTime} · ${timeZone}`;

  return (
    <section className="hh-heroSection" id="top">
      <div className="hh-waveOne" aria-hidden="true" />
      <div className="hh-waveTwo" aria-hidden="true" />
      <DottedField className="hh-dottedField" />

      <div className="hh-heroInner">
        <div className="hh-heroCopy">
          <div className="hh-eyebrow">
            <span aria-hidden="true" />
            Real-time browser fingerprint analysis
          </div>
          <h1>
            Detect. Analyze.{" "}<br />
            Trust with <em>Confidence.</em>
          </h1>
          <p>
            Fingerprint Checked reveals the unique signals your browser leaves
            behind—so you can prevent fraud, block bots, and protect your users.
          </p>

          <div className="hh-heroActions">
            <a className="hh-primaryCta" href="#analysis">
              Start analyzing now
              <ArrowRightMini />
            </a>
            <a className="hh-secondaryCta" href="#documentation">
              View documentation
              <FileText aria-hidden="true" size={14} />
            </a>
          </div>

          <div className="hh-benefits" aria-label="Product benefits">
            {[
              "No installation",
              "Real-time results",
              "Developer friendly",
              "Built for scale",
            ].map((benefit) => (
              <span key={benefit}>
                <CheckCircle2 aria-hidden="true" size={14} />
                {benefit}
              </span>
            ))}
          </div>
        </div>

        <div className="hh-analysisCard" id="analysis">
          <div className="hh-liveBadge">
            <span aria-hidden="true" />
            LIVE ANALYSIS
          </div>

          <div className="hh-analysisTop">
            <div className="hh-fingerprintBlock">
              <div className="hh-fingerprintTitle">
                <span className="hh-fingerprintGlobe" aria-hidden="true">
                  🌐
                </span>
                <div>
                  <span>Your Fingerprint</span>
                  <strong>{ipAddress}</strong>
                </div>
                <button
                  type="button"
                  className="hh-copyButton"
                  disabled={!ipInfo.ip}
                  onClick={onCopyIp}
                  aria-label={copied === "ip" ? "IP address copied" : "Copy IP address"}
                >
                  {copied === "ip" ? <Check aria-hidden="true" size={13} /> : <Copy aria-hidden="true" size={13} />}
                  {copied === "ip" ? "Copied" : "Copy IP"}
                </button>
              </div>
              <div className="hh-ipMeta">
                <span className="hh-ipv4Pill">IPv4</span>
                <span className="hh-ipAddressValue">{ipv4Address || "Not detected"}</span>
                <span className="hh-ipv6Pill">IPv6</span>
                <span className="hh-ipAddressValue">{ipv6Address || "Not detected"}</span>
              </div>
              <div className="hh-locationLine">
                <span className="hh-flag">{flag}</span>
                {location}
              </div>
            </div>

            <div className="hh-riskBlock">
              <div className="hh-riskContent">
                <div className="hh-riskPill">
                  <div className="hh-riskLabel">IP risk score:</div>
                  <strong>{normalizedRisk} <small>/ 100</small></strong>
                  <div
                    aria-label={`IP risk score ${normalizedRisk} out of 100`}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={normalizedRisk}
                    className="hh-riskRail"
                    data-level={riskLevel}
                    role="meter"
                  >
                    <span className="hh-riskTrack" aria-hidden="true">
                      <span className="hh-riskFill" />
                    </span>
                  </div>
                </div>
                <div className="hh-browserScore">
                  Browser Score: <strong>{browserScore} / 100</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="hh-summaryGrid hh-summaryGridCompact" aria-label="Browser and network summary">
            <SummaryRow icon={<Server size={14} />} label="ISP / Provider" value={provider} />
            <SummaryRow icon={<RadioTower size={14} />} label="WebRTC" tone={unexpectedWebRtcIp ? "warning" : webRtc.status === "complete" ? "good" : "neutral"} value={webRtcSummary} />
            <SummaryRow icon={<ShieldCheck size={14} />} label="Risk checks" tone={providerMismatch || isProxy || isCloud ? "warning" : securityEvaluated ? "good" : "neutral"} value={riskChecks} />
            <SummaryRow icon={<Network size={14} />} label="TCP/IP" value={tcpFingerprint} />
            <SummaryRow icon={<Compass size={14} />} label="Browser / Engine" value={browserIdentity} />
            <SummaryRow icon={<Laptop size={14} />} label="OS / Device" value={systemIdentity} />
            <SummaryRow icon={<FileText size={14} />} label="User-Agent" truncate value={browser.userAgent} wide />
            <SummaryRow icon={<Globe2 size={14} />} label="Location" value={locationSummary} />
            <SummaryRow icon={<Building2 size={14} />} label="Network owner" value={networkOwner} />
            <SummaryRow icon={<CalendarClock size={14} />} label="Local time" value={localTimeSummary} wide />
          </div>
        </div>
      </div>
    </section>
  );
}
