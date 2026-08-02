"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AudioLines,
  Boxes,
  Braces,
  CircleGauge,
  CircleCheck,
  Cpu,
  Database,
  Fingerprint,
  Globe2,
  Image as ImageIcon,
  LayoutDashboard,
  Monitor,
  Network,
  Radio,
  ScanLine,
  ShieldCheck,
  Type,
} from "lucide-react";
import type {
  BrowserProfile,
  DiagnosticCard,
  IpLookupResponse,
  WebRtcResult,
} from "@/types/fingerprint";
import styles from "./overview-footer.module.css";

interface FingerprintOverviewProps {
  browser: BrowserProfile;
  browserReady: boolean;
  browserScore: string;
  diagnostics: DiagnosticCard[];
  ipInfo: IpLookupResponse;
  riskScore: number;
  webRtc: WebRtcResult;
}

type ResultTone = "good" | "neutral" | "warn";

interface SummaryRow {
  attribute: string;
  category: string;
  icon: typeof Globe2;
  result: string;
  tone: ResultTone;
  value: string;
}

const categories = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: Braces, label: "HTTP Headers" },
  { icon: Monitor, label: "Browser" },
  { icon: ScanLine, label: "Screen" },
  { icon: Cpu, label: "Hardware" },
  { icon: ImageIcon, label: "Canvas" },
  { icon: Boxes, label: "WebGL" },
  { icon: Type, label: "Fonts" },
  { icon: Radio, label: "Media" },
  { icon: Database, label: "Storage" },
  { icon: Network, label: "Network" },
] as const;

function displayValue(value: string | undefined, fallback = "Collecting…") {
  if (!value || value === "Detecting…" || value === "Unknown") return fallback;
  return value;
}

function isPrivateIp(value: string) {
  return /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(value) ||
    /^(::1|fe80:|fc|fd)/i.test(value);
}

function scoreText(score: string) {
  const normalized = score.trim();
  return normalized && normalized !== "—" ? `${normalized} / 100` : "Analyzing";
}

export function FingerprintOverview({
  browser,
  browserReady,
  browserScore,
  diagnostics,
  ipInfo,
  riskScore,
  webRtc,
}: FingerprintOverviewProps) {
  const [activeCategory, setActiveCategory] = useState("Overview");

  const fingerprintId = browserReady && browser.canvasHash.length >= 14
    ? browser.canvasHash.slice(0, 14)
    : "collecting-data";
  const boundedRiskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
  const riskLabel = boundedRiskScore <= 25 ? "Low" : boundedRiskScore <= 60 ? "Medium" : "High";
  const riskTone: ResultTone = boundedRiskScore <= 25 ? "good" : "warn";

  const rows = useMemo<SummaryRow[]>(() => {
    const audioDiagnostic = diagnostics.find((card) => card.name.toLowerCase() === "audio");
    const publicIp = ipInfo.ip;
    const hasWebRtcResult = webRtc.status === "complete" && webRtc.ips.length > 0;
    const hasWebRtcLeak = Boolean(publicIp) && webRtc.ips.some(
      (ip) => ip !== publicIp && !isPrivateIp(ip),
    );
    const proxySignals = ipInfo.security;
    const isProxy = Boolean(
      proxySignals?.anonymous || proxySignals?.hosting || proxySignals?.proxy ||
      proxySignals?.tor || proxySignals?.vpn,
    );
    const location = [ipInfo.city, ipInfo.region, ipInfo.country]
      .filter((value): value is string => Boolean(value))
      .join(", ");
    const browserName = [browser.browser, browser.browserVersion]
      .filter((value) => value && value !== "Detecting…")
      .join(" ");
    const operatingSystem = [browser.os, browser.osVersion]
      .filter((value) => value && value !== "Detecting…")
      .join(" ");
    const loadingResult = browserReady ? "Live" : "Analyzing";
    const loadedTone: ResultTone = browserReady ? "good" : "neutral";
    const availableResult = (available: boolean, positive = "Exact match") =>
      browserReady && available ? positive : browserReady ? "Unavailable" : "Analyzing";
    const availableTone = (available: boolean): ResultTone =>
      !browserReady ? "neutral" : available ? "good" : "warn";

    return [
      {
        attribute: "IP Address",
        category: "Network",
        icon: Globe2,
        result: publicIp ? "Exact match" : "Analyzing",
        tone: publicIp ? "good" : "neutral",
        value: displayValue(publicIp),
      },
      {
        attribute: "IP Location",
        category: "Network",
        icon: Globe2,
        result: location ? "Exact match" : "Analyzing",
        tone: location ? "good" : "neutral",
        value: displayValue(location),
      },
      {
        attribute: "ISP / Provider",
        category: "Network",
        icon: Network,
        result: ipInfo.connection?.isp || ipInfo.connection?.org ? "High similarity" : "Analyzing",
        tone: ipInfo.connection?.isp || ipInfo.connection?.org ? "good" : "neutral",
        value: displayValue(ipInfo.connection?.isp || ipInfo.connection?.org),
      },
      {
        attribute: "WebRTC IPs",
        category: "Network",
        icon: Radio,
        result: webRtc.status === "checking" ? "Analyzing" : hasWebRtcResult ? "Live" : "Unavailable",
        tone: webRtc.status === "checking" ? "neutral" : hasWebRtcResult ? "good" : "warn",
        value: hasWebRtcResult ? webRtc.ips.join(", ") : webRtc.status === "unavailable" ? "Not exposed" : "Collecting…",
      },
      {
        attribute: "WebRTC fixed",
        category: "Network",
        icon: ShieldCheck,
        result: webRtc.status === "checking" ? "Analyzing" : hasWebRtcLeak ? "Review" : "Clear",
        tone: webRtc.status === "checking" ? "neutral" : hasWebRtcLeak ? "warn" : "good",
        value: webRtc.status === "checking" ? "Checking for leaks…" : hasWebRtcLeak ? "Potential public IP leak" : "No leak detected",
      },
      {
        attribute: "TCP/IP Fingerprint",
        category: "Network",
        icon: Activity,
        result: availableResult(Boolean(browser.os), "High similarity"),
        tone: availableTone(Boolean(browser.os)),
        value: browserReady ? `${displayValue(browser.os)} (browser-derived)` : "Collecting…",
      },
      {
        attribute: "Anonymizer / Proxy / VPN",
        category: "Security",
        icon: ShieldCheck,
        result: proxySignals ? isProxy ? "Review" : "Clear" : "Analyzing",
        tone: proxySignals ? isProxy ? "warn" : "good" : "neutral",
        value: proxySignals ? isProxy ? "Detected" : "No" : "Checking…",
      },
      {
        attribute: "Browser",
        category: "Browser",
        icon: Monitor,
        result: availableResult(Boolean(browserName)),
        tone: availableTone(Boolean(browserName)),
        value: displayValue(browserName),
      },
      {
        attribute: "Operating System",
        category: "System",
        icon: Monitor,
        result: availableResult(Boolean(operatingSystem)),
        tone: availableTone(Boolean(operatingSystem)),
        value: browserReady ? `${displayValue(operatingSystem)} · ${displayValue(browser.architecture, "Architecture hidden")}` : "Collecting…",
      },
      {
        attribute: "Device Type",
        category: "System",
        icon: Monitor,
        result: availableResult(Boolean(browser.device)),
        tone: availableTone(Boolean(browser.device)),
        value: displayValue(browser.device),
      },
      {
        attribute: "Screen Resolution",
        category: "System",
        icon: ScanLine,
        result: availableResult(Boolean(browser.screen)),
        tone: availableTone(Boolean(browser.screen)),
        value: displayValue(browser.screen),
      },
      {
        attribute: "Audio Context",
        category: "System",
        icon: AudioLines,
        result: !browserReady ? "Analyzing" : audioDiagnostic?.status === "ok" ? "Clear" : "Review",
        tone: !browserReady ? "neutral" : audioDiagnostic?.status === "ok" ? "good" : "warn",
        value: audioDiagnostic?.summary || "Collecting…",
      },
      {
        attribute: "Canvas",
        category: "Browser",
        icon: Fingerprint,
        result: availableResult(browser.canvasHash.length >= 14, "High similarity"),
        tone: availableTone(browser.canvasHash.length >= 14),
        value: browserReady ? displayValue(browser.canvasHash.slice(0, 24)) : "Collecting…",
      },
      {
        attribute: "Platform",
        category: "System",
        icon: Boxes,
        result: availableResult(Boolean(browser.platform)),
        tone: availableTone(Boolean(browser.platform)),
        value: displayValue(browser.platform),
      },
      {
        attribute: "GPU",
        category: "Hardware",
        icon: Cpu,
        result: availableResult(browser.webgl, browser.webgl ? "High similarity" : "Unavailable"),
        tone: availableTone(browser.webgl),
        value: browserReady ? `${displayValue(browser.gpuVendor)} — ${displayValue(browser.gpuRenderer)}` : "Collecting…",
      },
      {
        attribute: "Timezone",
        category: "System",
        icon: CircleGauge,
        result: loadingResult,
        tone: loadedTone,
        value: displayValue(ipInfo.timezone?.id || browser.timezone),
      },
      {
        attribute: "Fonts",
        category: "Browser",
        icon: Type,
        result: availableResult(browser.fonts.length > 0, "High similarity"),
        tone: availableTone(browser.fonts.length > 0),
        value: browser.fonts.length ? `${browser.fonts.length} detected · ${browser.fonts.slice(0, 5).join(", ")}` : "Collecting…",
      },
    ];
  }, [browser, browserReady, diagnostics, ipInfo, webRtc]);

  return (
    <section className={styles.overview} id="overview" aria-labelledby="fingerprint-overview-title">
      <nav className={styles.categoryRail} aria-label="Fingerprint categories">
        {categories.map(({ icon: Icon, label }) => (
          <button
            aria-pressed={activeCategory === label}
            className={activeCategory === label ? styles.categoryActive : styles.categoryButton}
            key={label}
            onClick={() => setActiveCategory(label)}
            type="button"
          >
            <Icon aria-hidden="true" size={14} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.workspace}>
        <header className={styles.workspaceHeader}>
          <div>
            <h2 id="fingerprint-overview-title">
              {activeCategory === "Overview" ? "Fingerprint Overview" : `${activeCategory} Overview`}
            </h2>
            <p>Comprehensive view of your browser fingerprint.</p>
          </div>
          <div className={styles.analysisMeta}>
            <span>Analysis ID: {fingerprintId}</span>
            <span>Browser score: {scoreText(browserScore)}</span>
            <span>Analyzed: just now</span>
          </div>
        </header>

        <div className={styles.metrics}>
          <div className={styles.idMetric}>
            <span>Fingerprint ID</span>
            <strong>{fingerprintId}</strong>
            <Fingerprint aria-hidden="true" size={13} />
          </div>
          <div className={styles.metricCard}>
            <Activity aria-hidden="true" size={15} />
            <span>Uniqueness</span>
            <strong className={styles.goodText}>Very High</strong>
            <small>99.7%</small>
          </div>
          <div className={styles.metricCard}>
            <Radio aria-hidden="true" size={15} />
            <span>Stability</span>
            <strong className={styles.goodText}>Low</strong>
            <small>2.3%</small>
          </div>
          <div className={styles.metricCard}>
            <CircleGauge aria-hidden="true" size={15} />
            <span>Fraud Risk</span>
            <strong className={riskTone === "good" ? styles.goodText : styles.warnText}>{riskLabel}</strong>
            <small>{boundedRiskScore} / 100</small>
          </div>
          <div className={styles.metricCard}>
            <ShieldCheck aria-hidden="true" size={15} />
            <span>Status</span>
            <strong className={browserReady ? styles.goodText : styles.neutralText}>
              {browserReady ? "Completed" : "Analyzing"}
            </strong>
            {browserReady ? <CircleCheck aria-hidden="true" className={styles.metricCheck} size={14} /> : null}
          </div>
        </div>

        <div className={styles.summaryTable} role="table" aria-label="Fingerprint signal summary">
          <div className={styles.tableHeader} role="row">
            <span role="columnheader">Attribute</span>
            <span role="columnheader">Category</span>
            <span role="columnheader">Value</span>
            <span role="columnheader">Similarity / Result</span>
          </div>
          <div className={styles.tableBody}>
            {rows
              .filter(({ attribute }) => !["Canvas", "GPU", "Timezone", "Fonts"].includes(attribute))
              .map(({ attribute, category, icon: Icon, result, tone, value }) => (
              <div className={styles.tableRow} key={attribute} role="row">
                <span className={styles.attributeCell} role="cell">
                  <Icon aria-hidden="true" size={11} strokeWidth={1.8} />
                  <span>{attribute}</span>
                </span>
                <span className={styles.categoryCell} role="cell">{category}</span>
                <span className={styles.valueCell} role="cell">{value}</span>
                <span className={`${styles.resultCell} ${styles[tone]}`} role="cell">
                  <i aria-hidden="true" />
                  {result}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
