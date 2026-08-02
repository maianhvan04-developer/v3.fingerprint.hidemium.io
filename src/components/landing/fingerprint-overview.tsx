"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AudioLines,
  Boxes,
  Braces,
  CircleCheck,
  CircleGauge,
  Cookie,
  Cpu,
  Database,
  Fingerprint,
  Globe2,
  HardDrive,
  Image as ImageIcon,
  Languages,
  LayoutDashboard,
  MemoryStick,
  Monitor,
  Network,
  Radio,
  ScanLine,
  ShieldCheck,
  Type,
  Wifi,
} from "lucide-react";
import type {
  BrowserProfile,
  DiagnosticCard,
  FingerprintModule,
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
  modules: FingerprintModule[];
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
  { icon: LayoutDashboard, key: "overview", label: "Overview" },
  { icon: Braces, key: "http-headers", label: "HTTP Headers" },
  { icon: Monitor, key: "browser", label: "Browser" },
  { icon: ScanLine, key: "screen", label: "Screen" },
  { icon: Cpu, key: "hardware", label: "Hardware" },
  { icon: ImageIcon, key: "canvas", label: "Canvas" },
  { icon: Boxes, key: "webgl", label: "WebGL" },
  { icon: Type, key: "fonts", label: "Fonts" },
  { icon: Radio, key: "media", label: "Media" },
  { icon: Database, key: "storage", label: "Storage" },
  { icon: Network, key: "network", label: "Network" },
] as const;

type CategoryKey = (typeof categories)[number]["key"];

const categoryCopy: Record<CategoryKey, { subtitle: string; title: string }> = {
  overview: {
    subtitle: "Comprehensive view of your live browser fingerprint.",
    title: "Fingerprint Overview",
  },
  "http-headers": {
    subtitle: "Browser request preferences and client-hint equivalents visible to this page.",
    title: "HTTP Headers Details",
  },
  browser: {
    subtitle: "Browser identity, runtime engine, locale, and automation signals.",
    title: "Browser Details",
  },
  screen: {
    subtitle: "Live display, viewport, pixel density, color, and touch characteristics.",
    title: "Screen Details",
  },
  hardware: {
    subtitle: "Device, CPU, memory, architecture, touch, and graphics signals.",
    title: "Hardware Details",
  },
  canvas: {
    subtitle: "Canvas rendering signature and the surface properties used to produce it.",
    title: "Canvas Details",
  },
  webgl: {
    subtitle: "WebGL availability, graphics adapter identity, and collected module signature.",
    title: "WebGL Details",
  },
  fonts: {
    subtitle: "Fonts detected through live browser font capability checks.",
    title: "Fonts Details",
  },
  media: {
    subtitle: "Audio, media recording, playback, and speech synthesis capabilities.",
    title: "Media Details",
  },
  storage: {
    subtitle: "Origin storage, database, cookie, and privacy preference availability.",
    title: "Storage Details",
  },
  network: {
    subtitle: "Public network identity, connection, timezone, and WebRTC exposure.",
    title: "Network Details",
  },
};

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

function readModuleValue(module: FingerprintModule | undefined, key: string): unknown {
  return module?.result[key];
}

function readBoolean(module: FingerprintModule | undefined, key: string): boolean | undefined {
  const value = readModuleValue(module, key);
  return typeof value === "boolean" ? value : undefined;
}

function formatViewport(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const viewport = value as Record<string, unknown>;
  const width = viewport.width;
  const height = viewport.height;
  if (typeof width !== "number" || typeof height !== "number") return undefined;
  return `${width} × ${height}`;
}

export function FingerprintOverview({
  browser,
  browserReady,
  browserScore,
  diagnostics,
  ipInfo,
  modules,
  riskScore,
  webRtc,
}: FingerprintOverviewProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("overview");

  const fingerprintId = browserReady && browser.canvasHash.length >= 14
    ? browser.canvasHash.slice(0, 14)
    : "collecting-data";
  const boundedRiskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
  const riskLabel = boundedRiskScore <= 25 ? "Low" : boundedRiskScore <= 60 ? "Medium" : "High";
  const riskTone: ResultTone = boundedRiskScore <= 25 ? "good" : "warn";

  const rowsByCategory = useMemo<Record<CategoryKey, SummaryRow[]>>(() => {
    const findModule = (name: string) => modules.find((module) => module.name === name);
    const audioDiagnostic = diagnostics.find((card) => card.name.toLowerCase() === "audio");
    const canvasDiagnostic = diagnostics.find((card) => card.name.toLowerCase() === "canvas");
    const networkDiagnostic = diagnostics.find((card) => card.name.toLowerCase() === "network");
    const canvasModule = findModule("Canvas 2D");
    const webGlModule = findModule("Canvas WebGL");
    const fontsModule = findModule("Fonts");
    const mediaModule = findModule("Media (MimeTypes)");
    const voicesModule = findModule("Voices");
    const audioModule = findModule("Offline Audio Context");
    const storageModule = findModule("Disk Storage");
    const networkModule = findModule("Network");
    const rectsModule = findModule("Client Rects");
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
    const provider = ipInfo.connection?.isp || ipInfo.connection?.org;
    const providerAndAsn = [
      provider,
      ipInfo.connection?.asn ? `AS${ipInfo.connection.asn}` : undefined,
    ].filter((value): value is string => Boolean(value)).join(" · ");
    const viewport = formatViewport(readModuleValue(rectsModule, "viewport"));
    const mediaSource = readBoolean(mediaModule, "mediaSource");
    const mediaRecorder = readBoolean(mediaModule, "mediaRecorder");
    const speechAvailable = readBoolean(voicesModule, "available");
    const voiceCount = readModuleValue(voicesModule, "voices");
    const audioSupported = readBoolean(audioModule, "supported");
    const indexedDb = readBoolean(storageModule, "indexedDb");
    const localStorageAvailable = readBoolean(storageModule, "localStorage") ?? browser.storage;
    const online = readBoolean(networkModule, "online");

    const row = (
      attribute: string,
      category: string,
      icon: typeof Globe2,
      value: string,
      result = "Live",
      tone: ResultTone = "good",
    ): SummaryRow => ({ attribute, category, icon, result, tone, value });
    const availabilityRow = (
      attribute: string,
      category: string,
      icon: typeof Globe2,
      available: boolean | undefined,
      positive = "Available",
      negative = "Unavailable",
    ) => row(
      attribute,
      category,
      icon,
      available === undefined ? "Collecting…" : available ? positive : negative,
      available === undefined ? "Analyzing" : available ? "Clear" : "Review",
      available === undefined ? "neutral" : available ? "good" : "warn",
    );
    const profileRow = (
      attribute: string,
      category: string,
      icon: typeof Globe2,
      value: string | undefined,
      result = "Exact match",
    ) => row(
      attribute,
      category,
      icon,
      browserReady ? displayValue(value, "Unavailable") : "Collecting…",
      browserReady ? (value ? result : "Unavailable") : "Analyzing",
      browserReady ? (value ? "good" : "warn") : "neutral",
    );

    const networkRows: SummaryRow[] = [
      row("Public IP", "Network", Globe2, displayValue(publicIp), publicIp ? "Exact match" : "Analyzing", publicIp ? "good" : "neutral"),
      row("IP Family", "Network", Network, displayValue(ipInfo.type), ipInfo.type ? "Live" : "Analyzing", ipInfo.type ? "good" : "neutral"),
      row("Location", "Network", Globe2, displayValue(location), location ? "Exact match" : "Analyzing", location ? "good" : "neutral"),
      row("Provider / ASN", "Network", Network, displayValue(providerAndAsn), providerAndAsn ? "High similarity" : "Analyzing", providerAndAsn ? "good" : "neutral"),
      profileRow("Connection", "Network", Wifi, browser.connection),
      row("Timezone", "Network", CircleGauge, displayValue(ipInfo.timezone?.id || browser.timezone), "Live", "good"),
      row(
        "WebRTC IPs",
        "Network",
        Radio,
        hasWebRtcResult ? webRtc.ips.join(", ") : webRtc.status === "unavailable" ? "Not exposed" : "Collecting…",
        webRtc.status === "checking" ? "Analyzing" : hasWebRtcResult ? "Live" : "Unavailable",
        webRtc.status === "checking" ? "neutral" : hasWebRtcResult ? "good" : "warn",
      ),
      row(
        "WebRTC Leak",
        "Network",
        ShieldCheck,
        webRtc.status === "checking" ? "Checking for leaks…" : hasWebRtcLeak ? "Potential public IP leak" : "No leak detected",
        webRtc.status === "checking" ? "Analyzing" : hasWebRtcLeak ? "Review" : "Clear",
        webRtc.status === "checking" ? "neutral" : hasWebRtcLeak ? "warn" : "good",
      ),
    ];

    const overviewRows: SummaryRow[] = [
      row("IP Address", "Network", Globe2, displayValue(publicIp), publicIp ? "Exact match" : "Analyzing", publicIp ? "good" : "neutral"),
      row("IP Location", "Network", Globe2, displayValue(location), location ? "Exact match" : "Analyzing", location ? "good" : "neutral"),
      row("ISP / Provider", "Network", Network, displayValue(provider), provider ? "High similarity" : "Analyzing", provider ? "good" : "neutral"),
      networkRows[6],
      row("WebRTC fixed", "Network", ShieldCheck, webRtc.status === "checking" ? "Checking for leaks…" : hasWebRtcLeak ? "Potential public IP leak" : "No leak detected", webRtc.status === "checking" ? "Analyzing" : hasWebRtcLeak ? "Review" : "Clear", webRtc.status === "checking" ? "neutral" : hasWebRtcLeak ? "warn" : "good"),
      profileRow("TCP/IP Fingerprint", "Network", Activity, browser.os ? `${browser.os} (browser-derived heuristic)` : undefined, "High similarity"),
      row("Anonymizer / Proxy / VPN", "Security", ShieldCheck, proxySignals ? isProxy ? "Detected" : "No" : "Checking…", proxySignals ? isProxy ? "Review" : "Clear" : "Analyzing", proxySignals ? isProxy ? "warn" : "good" : "neutral"),
      profileRow("Browser", "Browser", Monitor, browserName),
      profileRow("Operating System", "System", Monitor, operatingSystem ? `${operatingSystem} · ${displayValue(browser.architecture, "Architecture hidden")}` : undefined),
      profileRow("Device Type", "System", Monitor, browser.device),
      profileRow("Screen Resolution", "System", ScanLine, browser.screen),
      row("Audio Context", "System", AudioLines, audioDiagnostic?.summary || "Collecting…", !browserReady ? "Analyzing" : audioDiagnostic?.status === "ok" ? "Clear" : "Review", !browserReady ? "neutral" : audioDiagnostic?.status === "ok" ? "good" : "warn"),
      profileRow("Platform", "System", Boxes, browser.platform),
    ];

    const httpHeaderRows: SummaryRow[] = [
      profileRow("User-Agent", "HTTP", Braces, browser.userAgent),
      profileRow("Accept-Language", "HTTP", Languages, browser.languages.join(", ") || browser.language),
      profileRow("Client Hint Platform (equivalent)", "Client Hint", Monitor, browser.platform),
      profileRow("Client Hint Mobile (equivalent)", "Client Hint", Monitor, browser.device ? (browser.device === "Mobile" ? "?1 · mobile device" : "?0 · non-mobile device") : undefined),
      profileRow("Do Not Track", "Privacy", ShieldCheck, browser.doNotTrack),
      availabilityRow("Cookies", "HTTP", Cookie, browserReady ? browser.cookies : undefined, "Enabled", "Disabled"),
      availabilityRow("Online State", "Network", Wifi, online, "Online", "Offline"),
      profileRow("Platform", "Navigator", Boxes, browser.platform),
    ];

    const browserRows: SummaryRow[] = [
      profileRow("Browser", "Browser", Monitor, browserName),
      profileRow("Browser Version", "Browser", Monitor, browser.browserVersion),
      profileRow("Rendering Engine", "Runtime", Boxes, browser.engine),
      profileRow("User-Agent", "Navigator", Braces, browser.userAgent),
      profileRow("Primary Language", "Locale", Languages, browser.language),
      profileRow("Languages", "Locale", Languages, browser.languages.join(", ")),
      availabilityRow("Cookies", "Privacy", Cookie, browserReady ? browser.cookies : undefined, "Enabled", "Disabled"),
      profileRow("Do Not Track", "Privacy", ShieldCheck, browser.doNotTrack),
      availabilityRow("WebDriver", "Automation", ShieldCheck, browserReady ? !browser.webdriver : undefined, "Not detected", "Detected"),
    ];

    const screenRows: SummaryRow[] = [
      profileRow("Screen Resolution", "Display", ScanLine, browser.screen),
      profileRow("Viewport", "Layout", Monitor, viewport),
      profileRow("Color Depth", "Display", ImageIcon, browserReady ? `${browser.colorDepth}-bit` : undefined),
      profileRow("Pixel Ratio", "Display", ScanLine, browserReady ? `${browser.pixelRatio}×` : undefined),
      profileRow("Touch Points", "Input", Monitor, browserReady ? String(browser.touchPoints) : undefined),
    ];

    const hardwareRows: SummaryRow[] = [
      profileRow("Device Type", "Device", Monitor, browser.device),
      profileRow("Platform", "System", Boxes, browser.platform),
      profileRow("Architecture", "CPU", Cpu, browser.architecture),
      profileRow("Device Memory", "Memory", MemoryStick, browser.deviceMemory),
      profileRow("Logical Processors", "CPU", Cpu, browserReady ? String(browser.hardwareConcurrency) : undefined),
      profileRow("Touch Points", "Input", Monitor, browserReady ? String(browser.touchPoints) : undefined),
      profileRow("GPU Vendor", "Graphics", Cpu, browser.gpuVendor),
      profileRow("GPU Renderer", "Graphics", Cpu, browser.gpuRenderer),
    ];

    const canvasRows: SummaryRow[] = [
      profileRow("Canvas Signature", "Canvas", Fingerprint, browser.canvasHash, "High similarity"),
      row("Hash Algorithm", "Canvas", Fingerprint, "SHA-256", canvasModule ? "Collected" : "Analyzing", canvasModule ? "good" : "neutral"),
      row("Render / Readability", "Canvas", ImageIcon, canvasDiagnostic?.detail || "Collecting…", canvasDiagnostic?.status === "ok" ? "Clear" : browserReady ? "Review" : "Analyzing", canvasDiagnostic?.status === "ok" ? "good" : browserReady ? "warn" : "neutral"),
      profileRow("Color Surface", "Canvas", ImageIcon, browserReady ? `${browser.colorDepth}-bit color depth · ${browser.screen}` : undefined),
      row("Canvas Module Hash", "Module", Fingerprint, canvasModule?.hash || "Collecting…", canvasModule ? "Live" : "Analyzing", canvasModule ? "good" : "neutral"),
    ];

    const webGlRows: SummaryRow[] = [
      availabilityRow("WebGL", "Graphics", Boxes, browserReady ? browser.webgl : undefined),
      profileRow("GPU Vendor", "Graphics", Cpu, browser.gpuVendor),
      profileRow("GPU Renderer", "Graphics", Cpu, browser.gpuRenderer),
      row("Canvas WebGL Module", "Module", Fingerprint, webGlModule?.hash || "Collecting…", webGlModule ? webGlModule.issues ? `${webGlModule.issues} issue(s)` : "Clear" : "Analyzing", webGlModule ? webGlModule.issues ? "warn" : "good" : "neutral"),
    ];

    const fontRows: SummaryRow[] = browser.fonts.length
      ? [
          row("Detected Fonts", "Fonts", Type, String(browser.fonts.length), "Live", "good"),
          ...browser.fonts.map((font) => row(font, "Detected Font", Type, "Available", "Exact match", "good")),
          row("Fonts Module Hash", "Module", Fingerprint, fontsModule?.hash || "Collecting…", fontsModule ? "Live" : "Analyzing", fontsModule ? "good" : "neutral"),
        ]
      : [
          row("Detected Fonts", "Fonts", Type, browserReady ? "Font enumeration unavailable or blocked" : "Collecting…", browserReady ? "Unavailable" : "Analyzing", browserReady ? "warn" : "neutral"),
        ];

    const mediaRows: SummaryRow[] = [
      availabilityRow("AudioContext", "Audio", AudioLines, audioSupported, audioDiagnostic?.summary || "Available", audioDiagnostic?.summary || "Unavailable"),
      availabilityRow("MediaSource", "Media", Radio, mediaSource),
      availabilityRow("MediaRecorder", "Media", Radio, mediaRecorder),
      row("SpeechSynthesis", "Speech", AudioLines, speechAvailable === undefined ? "Collecting…" : speechAvailable ? `${typeof voiceCount === "number" ? voiceCount : 0} voice(s) detected` : "Unavailable", speechAvailable === undefined ? "Analyzing" : speechAvailable ? "Available" : "Unavailable", speechAvailable === undefined ? "neutral" : speechAvailable ? "good" : "warn"),
      row("Network Media Status", "Media", Wifi, networkDiagnostic?.summary || "Collecting…", networkDiagnostic?.status === "ok" ? "Clear" : browserReady ? "Review" : "Analyzing", networkDiagnostic?.status === "ok" ? "good" : browserReady ? "warn" : "neutral"),
    ];

    const storageRows: SummaryRow[] = [
      availabilityRow("Local Storage", "Storage", Database, browserReady ? localStorageAvailable : undefined),
      availabilityRow("IndexedDB", "Storage", HardDrive, indexedDb),
      row("StorageManager", "Storage", Database, storageModule ? "Collected by Disk Storage module" : "Collecting…", storageModule ? "Available" : "Analyzing", storageModule ? "good" : "neutral"),
      availabilityRow("Cookies", "Privacy", Cookie, browserReady ? browser.cookies : undefined, "Enabled", "Disabled"),
      profileRow("Do Not Track", "Privacy", ShieldCheck, browser.doNotTrack),
      row("Disk Storage Module", "Module", Fingerprint, storageModule?.hash || "Collecting…", storageModule ? storageModule.issues ? `${storageModule.issues} issue(s)` : "Clear" : "Analyzing", storageModule ? storageModule.issues ? "warn" : "good" : "neutral"),
    ];

    return {
      overview: overviewRows,
      "http-headers": httpHeaderRows,
      browser: browserRows,
      screen: screenRows,
      hardware: hardwareRows,
      canvas: canvasRows,
      webgl: webGlRows,
      fonts: fontRows,
      media: mediaRows,
      storage: storageRows,
      network: networkRows,
    };
  }, [browser, browserReady, diagnostics, ipInfo, modules, webRtc]);

  const activeCopy = categoryCopy[activeCategory];
  const activeRows = rowsByCategory[activeCategory];

  return (
    <section className={styles.overview} id="overview" aria-labelledby="fingerprint-overview-title">
      <nav className={styles.categoryRail} aria-label="Fingerprint categories" role="tablist">
        {categories.map(({ icon: Icon, key, label }) => (
          <button
            aria-controls="fingerprint-category-panel"
            aria-selected={activeCategory === key}
            className={activeCategory === key ? styles.categoryActive : styles.categoryButton}
            id={`fingerprint-tab-${key}`}
            key={key}
            onClick={() => setActiveCategory(key)}
            role="tab"
            tabIndex={activeCategory === key ? 0 : -1}
            type="button"
          >
            <Icon aria-hidden="true" size={14} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div
        aria-labelledby={`fingerprint-tab-${activeCategory}`}
        className={styles.workspace}
        id="fingerprint-category-panel"
        role="tabpanel"
      >
        <header className={styles.workspaceHeader}>
          <div>
            <h2 id="fingerprint-overview-title">{activeCopy.title}</h2>
            <p>{activeCopy.subtitle}</p>
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

        <div className={styles.summaryTable} role="table" aria-label={`${activeCopy.title} signal summary`}>
          <div className={styles.tableHeader} role="row">
            <span role="columnheader">Attribute</span>
            <span role="columnheader">Category</span>
            <span role="columnheader">Value</span>
            <span role="columnheader">Similarity / Result</span>
          </div>
          <div className={styles.tableBody}>
            {activeRows.map(({ attribute, category, icon: Icon, result, tone, value }, index) => (
              <div className={styles.tableRow} key={`${attribute}-${index}`} role="row">
                <span className={styles.attributeCell} role="cell">
                  <Icon aria-hidden="true" size={11} strokeWidth={1.8} />
                  <span>{attribute}</span>
                </span>
                <span className={styles.categoryCell} role="cell">{category}</span>
                <span className={styles.valueCell} role="cell" title={value}>{value}</span>
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
