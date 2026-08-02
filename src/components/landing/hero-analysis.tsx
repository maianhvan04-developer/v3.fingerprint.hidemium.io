"use client";

import {
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Cloud,
  Compass,
  Copy,
  Earth,
  FileText,
  Laptop,
  Monitor,
  Network,
  RadioTower,
  Server,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { ArrowRightMini, DottedField } from "@/components/icons";
import type {
  BrowserProfile,
  CopyKind,
  IpLookupResponse,
  WebRtcResult,
} from "@/types/fingerprint";
import styles from "./header-hero.module.css";

export interface HeroAnalysisProps {
  browser: BrowserProfile;
  browserScore: number | string;
  copied: CopyKind | null;
  ipAddress: string;
  ipInfo: IpLookupResponse;
  onCopyIp: () => Promise<void> | void;
  riskScore: number;
  webRtc: WebRtcResult;
}

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  tone?: "good" | "neutral" | "warning";
  value: string;
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

function SummaryRow({ icon, label, tone = "neutral", value }: SummaryRowProps) {
  return (
    <div className={styles.summaryRow}>
      <span className={styles.summaryIcon} data-tone={tone}>{icon}</span>
      <span className={styles.summaryLabel}>{label}</span>
      <span className={styles.summaryValue} data-tone={tone}>{value}</span>
    </div>
  );
}

export function HeroAnalysis({
  browser,
  browserScore,
  copied,
  ipAddress,
  ipInfo,
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
  const webRtcIps = webRtc.status === "checking"
    ? "Detecting…"
    : webRtc.ips.length > 0 ? webRtc.ips.join(", ") : "No public IP exposed";
  const webRtcStatus = webRtc.status === "checking"
    ? "Checking"
    : webRtc.status === "unavailable" ? "Unavailable" : "No leak";
  const isProxy = Boolean(ipInfo.security?.proxy || ipInfo.security?.vpn || ipInfo.security?.tor);
  const isCloud = Boolean(ipInfo.security?.hosting);
  const browserLabel = [readable(browser.browser), browser.browserVersion]
    .filter((part) => part && part !== "Unknown")
    .join(" ");
  const osLabel = [readable(browser.os), browser.osVersion]
    .filter((part) => part && part !== "Unknown")
    .join(" ");
  const normalizedRisk = Math.max(0, Math.min(100, Math.round(riskScore)));
  const riskLevel = String(Math.round(normalizedRisk / 10));

  return (
    <section className={styles.heroSection} id="top">
      <div className={styles.waveOne} aria-hidden="true" />
      <div className={styles.waveTwo} aria-hidden="true" />
      <DottedField className={styles.dottedField} />

      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
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

          <div className={styles.heroActions}>
            <a className={styles.primaryCta} href="#analysis">
              Start analyzing now
              <ArrowRightMini />
            </a>
            <a className={styles.secondaryCta} href="#documentation">
              View documentation
              <FileText aria-hidden="true" size={14} />
            </a>
          </div>

          <div className={styles.benefits} aria-label="Product benefits">
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

        <div className={styles.analysisCard} id="analysis">
          <div className={styles.liveBadge}>
            <span aria-hidden="true" />
            LIVE ANALYSIS
          </div>

          <div className={styles.analysisTop}>
            <div className={styles.fingerprintBlock}>
              <div className={styles.fingerprintTitle}>
                <Earth aria-hidden="true" size={27} />
                <div>
                  <span>Your Fingerprint</span>
                  <strong>{ipAddress}</strong>
                </div>
                <button
                  type="button"
                  className={styles.copyButton}
                  disabled={!ipInfo.ip}
                  onClick={onCopyIp}
                  aria-label={copied === "ip" ? "IP address copied" : "Copy IP address"}
                >
                  {copied === "ip" ? <Check aria-hidden="true" size={13} /> : <Copy aria-hidden="true" size={13} />}
                  {copied === "ip" ? "Copied" : "Copy IP"}
                </button>
              </div>
              <div className={styles.ipMeta}>
                <span className={styles.ipv4Pill}>{ipInfo.type || "IPv4"}</span>
                <span>{ipAddress}</span>
                <span className={styles.ipv6Pill}>IPv6 not detected</span>
              </div>
              <div className={styles.locationLine}>
                <span className={styles.flag}>{flag}</span>
                {location}
              </div>
            </div>

            <div className={styles.riskBlock}>
              <div className={styles.riskLabel}>Risk Score <span aria-label="Risk score information">?</span></div>
              <strong>{normalizedRisk} <small>/ 100</small></strong>
              <div className={styles.riskRail} data-level={riskLevel} aria-label={`Risk score ${normalizedRisk} out of 100`}>
                <span className={styles.riskMarker} />
              </div>
              <div className={styles.browserScore}>
                Browser Score: <strong>{browserScore} / 100</strong>
              </div>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryColumn}>
              <SummaryRow icon={<Server size={14} />} label="ISP / Provider" value={provider} />
              <SummaryRow icon={<RadioTower size={14} />} label="WebRTC IPs" value={webRtcIps} />
              <SummaryRow icon={<Wifi size={14} />} label="WebRTC used" tone={webRtcStatus === "No leak" ? "good" : "warning"} value={webRtcStatus} />
              <SummaryRow icon={<ShieldCheck size={14} />} label="Anonymizer" tone={isProxy ? "warning" : "good"} value={isProxy ? "Detected" : "No"} />
              <SummaryRow icon={<Network size={14} />} label="TCP/IP Fingerprint" value={readable(browser.os)} />
            </div>
            <div className={styles.summaryColumn}>
              <SummaryRow icon={<BriefcaseBusiness size={14} />} label="Fake ISP" tone={isProxy ? "warning" : "good"} value={isProxy ? "Possible" : "No"} />
              <SummaryRow icon={<Cloud size={14} />} label="Cloud Provider" tone={isCloud ? "warning" : "good"} value={isCloud ? "Yes" : "No"} />
              <SummaryRow icon={<Compass size={14} />} label="Browser" value={browserLabel || "Detecting…"} />
              <SummaryRow icon={<Monitor size={14} />} label="Operating System" value={osLabel || "Detecting…"} />
              <SummaryRow
                icon={<Laptop size={14} />}
                label="Device Type"
                value={[readable(browser.device), readable(browser.platform, "")].filter(Boolean).join(" · ")}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
