"use client";

import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  Cloud,
  Compass,
  Copy,
  Cpu,
  FileText,
  Globe2,
  Laptop,
  MapPin,
  MapPinned,
  Monitor,
  Network,
  RadioTower,
  Router,
  Server,
  ShieldCheck,
  Tag,
  UserRound,
  Wifi,
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

function SummaryRow({ icon, label, tone = "neutral", value, wide = false }: SummaryRowProps) {
  return (
    <div className="hh-summaryRow" data-wide={wide || undefined}>
      <span className="hh-summaryIcon" data-tone={tone}>{icon}</span>
      <span className="hh-summaryLabel">{label}</span>
      <span className="hh-summaryValue" data-tone={tone}>{value}</span>
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
  const publicWebRtcIpv6 = publicWebRtcIps.filter((address) => address.includes(":"));
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
  const host = ipInfo.connection?.domain || "No reverse DNS data";
  const asNumber = ipInfo.connection?.asn ? `AS${ipInfo.connection.asn}` : "Detecting…";
  const coordinates = typeof ipInfo.latitude === "number" && typeof ipInfo.longitude === "number"
    ? `${ipInfo.latitude.toFixed(5)}, ${ipInfo.longitude.toFixed(5)}`
    : "Detecting…";
  const timeZone = readable(ipInfo.timezone?.id || browser.timezone);

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

          <div className="hh-summaryGroups">
            <section className="hh-summaryGroup" aria-labelledby="general-ip-title">
              <header className="hh-summaryGroupHeader">
                <span><Globe2 aria-hidden="true" /></span>
                <div>
                  <h2 id="general-ip-title">General IP info</h2>
                  <p>Network identity and server-observed address signals.</p>
                </div>
              </header>
              <div className="hh-summaryGrid">
                <SummaryRow icon={<Server size={14} />} label="ISP / Provider" value={provider} />
                <SummaryRow icon={<RadioTower size={14} />} label="WebRTC IPv4" tone={unexpectedWebRtcIp ? "warning" : webRtc.status === "complete" ? "good" : "neutral"} value={webRtcAddress(publicWebRtcIpv4)} />
                <SummaryRow icon={<RadioTower size={14} />} label="WebRTC IPv6" tone={unexpectedWebRtcIp ? "warning" : webRtc.status === "complete" ? "good" : "neutral"} value={webRtcAddress(publicWebRtcIpv6)} />
                <SummaryRow icon={<BriefcaseBusiness size={14} />} label="Fake ISP" tone={providerMismatch ? "warning" : securityEvaluated ? "good" : "neutral"} value={providerMismatch ? "Possible mismatch" : securityEvaluated ? "No" : "Not evaluated"} />
                <SummaryRow icon={<ShieldCheck size={14} />} label="Anonymizer" tone={isProxy ? "warning" : securityEvaluated ? "good" : "neutral"} value={isProxy ? "Detected" : securityEvaluated ? "No" : "Not evaluated"} />
                <SummaryRow icon={<Cloud size={14} />} label="Cloud Provider" tone={isCloud ? "warning" : securityEvaluated ? "good" : "neutral"} value={isCloud ? "Yes" : securityEvaluated ? "No" : "Not evaluated"} />
                <SummaryRow icon={<Network size={14} />} label="TCP/IP Fingerprint" value={tcpFingerprint} />
                <SummaryRow icon={<Monitor size={14} />} label="Browser OS" value={readable(browser.os)} />
                <SummaryRow icon={<Wifi size={14} />} label="WebRTC status" tone={webRtcStatus === "No leak" ? "good" : "warning"} value={webRtcStatus} />
                <SummaryRow icon={<Router size={14} />} label="Public IP type" value={ipInfo.type || (ipv6Address ? "IPv6" : ipv4Address ? "IPv4" : "Detecting…")} />
              </div>
            </section>

            <section className="hh-summaryGroup" aria-labelledby="user-agent-title">
              <header className="hh-summaryGroupHeader">
                <span><UserRound aria-hidden="true" /></span>
                <div>
                  <h2 id="user-agent-title">User-Agent &amp; OS</h2>
                  <p>Browser identity, release family and operating system.</p>
                </div>
              </header>
              <div className="hh-summaryGrid">
                <SummaryRow icon={<FileText size={14} />} label="User-Agent" value={browser.userAgent} wide />
                <SummaryRow icon={<Compass size={14} />} label="Browser" value={browserLabel || "Detecting…"} />
                <SummaryRow icon={<Cpu size={14} />} label="Engine" value={readable(browser.engine)} />
                <SummaryRow icon={<Tag size={14} />} label="Release Channel" tone={browser.browserVersion ? "good" : "neutral"} value={releaseChannel} />
                <SummaryRow icon={<Monitor size={14} />} label="Operating System" value={readable(browser.os)} />
                <SummaryRow icon={<Monitor size={14} />} label="OS Version" value={readable(browser.osVersion)} />
                <SummaryRow icon={<Laptop size={14} />} label="Device Type" value={readable(browser.device)} />
                <SummaryRow icon={<Cpu size={14} />} label="Architecture" value={readable(browser.architecture)} />
                <SummaryRow icon={<Network size={14} />} label="Platform" value={readable(browser.platform)} />
              </div>
            </section>

            <section className="hh-summaryGroup" aria-labelledby="location-title">
              <header className="hh-summaryGroupHeader">
                <span><MapPin aria-hidden="true" /></span>
                <div>
                  <h2 id="location-title">Location</h2>
                  <p>Location and network ownership exposed by the public IP.</p>
                </div>
              </header>
              <div className="hh-summaryGrid">
                <SummaryRow icon={<Globe2 size={14} />} label="Country" value={ipInfo.country_code || ipInfo.country || "Detecting…"} />
                <SummaryRow icon={<MapPinned size={14} />} label="Region" value={ipInfo.region || "Detecting…"} />
                <SummaryRow icon={<MapPin size={14} />} label="City" value={ipInfo.city || "Detecting…"} />
                <SummaryRow icon={<Tag size={14} />} label="ZIP" value={ipInfo.postal || "Detecting…"} />
                <SummaryRow icon={<Server size={14} />} label="Host" value={host} />
                <SummaryRow icon={<MapPinned size={14} />} label="Lat / Lon" value={coordinates} />
                <SummaryRow icon={<Building2 size={14} />} label="Organization" value={organization} />
                <SummaryRow icon={<Building2 size={14} />} label="AS Organization" value={organization} />
                <SummaryRow icon={<Server size={14} />} label="ISP" value={ipInfo.connection?.isp || provider} />
                <SummaryRow icon={<Tag size={14} />} label="AS Number" value={asNumber} />
              </div>
            </section>

            <section className="hh-summaryGroup" aria-labelledby="time-title">
              <header className="hh-summaryGroupHeader">
                <span><CalendarClock aria-hidden="true" /></span>
                <div>
                  <h2 id="time-title">Time</h2>
                  <p>Local clock and timezone resolved for this environment.</p>
                </div>
              </header>
              <div className="hh-summaryGrid">
                <SummaryRow icon={<CalendarClock size={14} />} label="Local time" value={localTime} />
                <SummaryRow icon={<Globe2 size={14} />} label="Time zone" value={timeZone} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
