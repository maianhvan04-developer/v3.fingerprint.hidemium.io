"use client";

import { type KeyboardEvent, useMemo, useState } from "react";
import {
  Activity,
  AudioLines,
  Boxes,
  Braces,
  CircleCheck,
  CircleGauge,
  Clipboard,
  Cookie,
  Cpu,
  Database,
  Download,
  FileJson,
  Fingerprint,
  Globe2,
  HardDrive,
  Hash,
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
import {
  fingerprintModuleKeys,
  type BrowserProfile,
  type CopyKind,
  type DiagnosticCard,
  type FingerprintModule,
  type HttpHeadersSnapshot,
  type IpLookupResponse,
  type IpRiskProfile,
  type WebRtcResult,
} from "@/types/fingerprint";
import styles from "./overview-footer.module.css";

interface FingerprintOverviewProps {
  browser: BrowserProfile;
  browserReady: boolean;
  browserScore: string;
  collectedModuleCount: number;
  copied: CopyKind | null;
  diagnostics: DiagnosticCard[];
  fullJson: string;
  fullJsonReady: boolean;
  httpHeaders: HttpHeadersSnapshot;
  ipInfo: IpLookupResponse;
  ipRisk: IpRiskProfile;
  modules: FingerprintModule[];
  onCopyJson: () => void;
  onDownloadJson: () => void;
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
  { icon: FileJson, key: "full-json", label: "Full JSON" },
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
  "full-json": {
    subtitle: "Complete live payload from all collected fingerprint modules.",
    title: "Full Fingerprint JSON",
  },
};

function formatPayloadSize(value: string) {
  const bytes = new TextEncoder().encode(value).byteLength;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function displayValue(value: string | undefined, fallback = "Collecting…") {
  if (!value || value === "Detecting…" || value === "Unknown") return fallback;
  return value;
}

function isPrivateIp(value: string) {
  if (value.endsWith(".local") || (!value.includes(":") && !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value))) {
    return true;
  }
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

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function readRecord(module: FingerprintModule | undefined, key: string) {
  return asRecord(readModuleValue(module, key));
}

function formatUnknown(value: unknown): string | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (Array.isArray(value)) {
    const formatted = value.map((item) => {
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return formatUnknown(record.name ?? record.brand ?? item);
      }
      return formatUnknown(item);
    }).filter((item): item is string => Boolean(item));
    return formatted.length ? formatted.join(", ") : undefined;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

function readStringArray(module: FingerprintModule | undefined, key: string) {
  const value = readModuleValue(module, key);
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function formatBytes(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(2)} GB`;
  if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(2)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(2)} KB`;
  return `${value} B`;
}

function readBoolean(module: FingerprintModule | undefined, key: string): boolean | undefined {
  const value = readModuleValue(module, key);
  return typeof value === "boolean" ? value : undefined;
}

export function FingerprintOverview({
  browser,
  browserReady,
  browserScore,
  collectedModuleCount,
  copied,
  diagnostics,
  fullJson,
  fullJsonReady,
  httpHeaders,
  ipInfo,
  ipRisk,
  modules,
  onCopyJson,
  onDownloadJson,
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
    const navigatorModule = findModule("Navigator");
    const browserVersionModule = findModule("Browser Version / Channel");
    const windowModule = findModule("Window Features");
    const headlessModule = findModule("Headless / Stealth");
    const cssMediaModule = findModule("CSS Media Queries");
    const screenModule = findModule("Screen");
    const canvasModule = findModule("Canvas 2D");
    const webGlModule = findModule("Canvas WebGL");
    const fontsModule = findModule("Fonts");
    const mediaModule = findModule("Media (MimeTypes)");
    const voicesModule = findModule("Voices");
    const audioModule = findModule("Offline Audio Context");
    const storageModule = findModule("Disk Storage");
    const networkModule = findModule("Network");
    const rectsModule = findModule("Client Rects");
    const batteryModule = findModule("Battery");
    const automationModule = findModule("Automation (BotD)");
    const publicIp = ipInfo.ip;
    const ipv4 = ipInfo.ipv4 || (publicIp && !publicIp.includes(":") ? publicIp : undefined);
    const ipv6 = ipInfo.ipv6 || (publicIp?.includes(":") ? publicIp : undefined);
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
    const viewportWidth = readModuleValue(screenModule, "viewportWidth");
    const viewportHeight = readModuleValue(screenModule, "viewportHeight");
    const viewport = typeof viewportWidth === "number" && typeof viewportHeight === "number"
      ? `${viewportWidth} × ${viewportHeight}`
      : undefined;
    const availableWidth = readModuleValue(screenModule, "availWidth");
    const availableHeight = readModuleValue(screenModule, "availHeight");
    const availableScreen = typeof availableWidth === "number" && typeof availableHeight === "number"
      ? `${availableWidth} × ${availableHeight}`
      : undefined;
    const outerWidthValue = readModuleValue(windowModule, "outerWidth");
    const outerHeightValue = readModuleValue(windowModule, "outerHeight");
    const outerWindow = typeof outerWidthValue === "number" && typeof outerHeightValue === "number"
      ? `${outerWidthValue} × ${outerHeightValue}`
      : undefined;
    const mediaSource = readBoolean(mediaModule, "mediaSource");
    const mediaRecorder = readBoolean(mediaModule, "mediaRecorder");
    const speechAvailable = readBoolean(voicesModule, "available");
    const voiceCount = readModuleValue(voicesModule, "voices");
    const audioSupported = readBoolean(audioModule, "audioContext");
    const indexedDb = readBoolean(storageModule, "indexedDb");
    const localStorageAvailable = readBoolean(storageModule, "localStorage") ?? browser.storage;
    const online = readBoolean(networkModule, "onLine");
    const webRtcIpv4 = webRtc.ips.filter((address) => !address.includes(":"));
    const webRtcIpv6 = webRtc.ips.filter((address) => address.includes(":"));
    const detectedFonts = readStringArray(fontsModule, "detected");
    const uaHints = readRecord(navigatorModule, "userAgentData");
    const permissionSummary = readRecord(navigatorModule, "permissions");
    const webGpu = readRecord(navigatorModule, "webgpu");
    const mediaFormats = readRecord(mediaModule, "formats");

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
      row("IPv4 Address", "Network", Globe2, displayValue(ipv4, "Not detected"), ipv4 ? "Live" : "Unavailable", ipv4 ? "good" : "neutral"),
      row("IPv6 Address", "Network", Globe2, displayValue(ipv6, "Not detected"), ipv6 ? "Live" : "Unavailable", ipv6 ? "good" : "neutral"),
      row("IP Family", "Network", Network, displayValue(ipInfo.type), ipInfo.type ? "Live" : "Analyzing", ipInfo.type ? "good" : "neutral"),
      row("Location", "Network", Globe2, displayValue(location), location ? "Exact match" : "Analyzing", location ? "good" : "neutral"),
      row("Country / Code", "GeoIP", Globe2, displayValue([ipInfo.country, ipInfo.country_code].filter(Boolean).join(" · ")), ipInfo.country_code ? "Live" : "Analyzing", ipInfo.country_code ? "good" : "neutral"),
      row("Region / Code", "GeoIP", Globe2, displayValue([ipInfo.region, ipInfo.region_code].filter(Boolean).join(" · ")), ipInfo.region ? "Live" : "Analyzing", ipInfo.region ? "good" : "neutral"),
      row("City / Postal", "GeoIP", Globe2, displayValue([ipInfo.city, ipInfo.postal].filter(Boolean).join(" · ")), ipInfo.city ? "Live" : "Analyzing", ipInfo.city ? "good" : "neutral"),
      row("Coordinates", "GeoIP", Globe2, typeof ipInfo.latitude === "number" && typeof ipInfo.longitude === "number" ? `${ipInfo.latitude}, ${ipInfo.longitude}` : "Collecting…", typeof ipInfo.latitude === "number" ? "Live" : "Analyzing", typeof ipInfo.latitude === "number" ? "good" : "neutral"),
      row("Provider / ASN", "Network", Network, displayValue(providerAndAsn), providerAndAsn ? "High similarity" : "Analyzing", providerAndAsn ? "good" : "neutral"),
      row("IP Risk Score", "Security", CircleGauge, typeof ipRisk.score === "number" ? `${ipRisk.score} / 100${ipRisk.verdict ? ` · ${ipRisk.verdict}` : ""}` : ipRisk.status === "loading" ? "Collecting…" : "Unavailable", ipRisk.status === "loading" ? "Analyzing" : typeof ipRisk.score === "number" ? "Live" : "Unavailable", ipRisk.status === "loading" ? "neutral" : typeof ipRisk.score === "number" ? "good" : "warn"),
      profileRow("Connection", "Network", Wifi, browser.connection),
      row("Effective Type", "NetworkInformation", Wifi, displayValue(formatUnknown(readModuleValue(networkModule, "effectiveType")), "Not exposed"), networkModule ? "Live" : "Analyzing", networkModule ? "good" : "neutral"),
      row("Downlink", "NetworkInformation", Wifi, typeof readModuleValue(networkModule, "downlink") === "number" ? `${readModuleValue(networkModule, "downlink")} Mbps` : "Not exposed", networkModule ? "Live" : "Analyzing", networkModule ? "good" : "neutral"),
      row("Round-trip Time", "NetworkInformation", Wifi, typeof readModuleValue(networkModule, "rtt") === "number" ? `${readModuleValue(networkModule, "rtt")} ms` : "Not exposed", networkModule ? "Live" : "Analyzing", networkModule ? "good" : "neutral"),
      row("Save Data", "NetworkInformation", Wifi, formatUnknown(readModuleValue(networkModule, "saveData")) || "Not exposed", networkModule ? "Live" : "Analyzing", networkModule ? "good" : "neutral"),
      row("IP Timezone", "GeoIP", CircleGauge, displayValue(ipInfo.timezone?.id), ipInfo.timezone?.id ? "Live" : "Analyzing", ipInfo.timezone?.id ? "good" : "neutral"),
      profileRow("Browser Timezone", "Intl", CircleGauge, browser.timezone),
      row(
        "WebRTC IPv4",
        "Network",
        Radio,
        webRtcIpv4.length ? webRtcIpv4.join(", ") : webRtc.status === "checking" ? "Collecting…" : "Not exposed",
        webRtc.status === "checking" ? "Analyzing" : webRtcIpv4.length ? "Live" : "Unavailable",
        webRtc.status === "checking" ? "neutral" : webRtcIpv4.length ? "good" : "neutral",
      ),
      row(
        "WebRTC IPv6",
        "Network",
        Radio,
        webRtcIpv6.length ? webRtcIpv6.join(", ") : webRtc.status === "checking" ? "Collecting…" : "Not exposed",
        webRtc.status === "checking" ? "Analyzing" : webRtcIpv6.length ? "Live" : "Unavailable",
        webRtc.status === "checking" ? "neutral" : webRtcIpv6.length ? "good" : "neutral",
      ),
      row("ICE Candidates", "WebRTC", Radio, webRtc.status === "checking" ? "Collecting…" : String(webRtc.candidates.length), webRtc.status === "checking" ? "Analyzing" : "Live", webRtc.status === "checking" ? "neutral" : "good"),
      row(
        "WebRTC Leak",
        "Network",
        ShieldCheck,
        webRtc.status === "checking" ? "Checking for leaks…" : hasWebRtcLeak ? "Potential public IP leak" : "No leak detected",
        webRtc.status === "checking" ? "Analyzing" : hasWebRtcLeak ? "Review" : "Clear",
        webRtc.status === "checking" ? "neutral" : hasWebRtcLeak ? "warn" : "good",
      ),
      row("TCP/IP Fingerprint", "Server Signal", Activity, "Unavailable — origin-authorized SYN inspection required", "Not evaluable", "neutral"),
      availabilityRow("Online State", "Network", Wifi, online, "Online", "Offline"),
    ];

    const overviewRows: SummaryRow[] = [
      row("Primary IP", "Network", Globe2, displayValue(publicIp), publicIp ? "Exact match" : "Analyzing", publicIp ? "good" : "neutral"),
      networkRows[1],
      networkRows[2],
      row("IP Location", "Network", Globe2, displayValue(location), location ? "Exact match" : "Analyzing", location ? "good" : "neutral"),
      row("ISP / Provider", "Network", Network, displayValue(provider), provider ? "High similarity" : "Analyzing", provider ? "good" : "neutral"),
      row("IP Risk", "Security", CircleGauge, typeof ipRisk.score === "number" ? `${ipRisk.score} / 100${ipRisk.verdict ? ` · ${ipRisk.verdict}` : ""}` : ipRisk.status === "loading" ? "Collecting…" : `${boundedRiskScore} / 100 · estimated`, ipRisk.status === "complete" ? "Live" : ipRisk.status === "loading" ? "Analyzing" : "Estimated", ipRisk.status === "complete" ? "good" : "neutral"),
      row("WebRTC IPv4", "Network", Radio, webRtcIpv4.length ? webRtcIpv4.join(", ") : webRtc.status === "checking" ? "Collecting…" : "Not exposed", webRtc.status === "checking" ? "Analyzing" : webRtcIpv4.length ? "Live" : "Unavailable", webRtc.status === "checking" ? "neutral" : "good"),
      row("WebRTC IPv6", "Network", Radio, webRtcIpv6.length ? webRtcIpv6.join(", ") : webRtc.status === "checking" ? "Collecting…" : "Not exposed", webRtc.status === "checking" ? "Analyzing" : webRtcIpv6.length ? "Live" : "Unavailable", webRtc.status === "checking" ? "neutral" : "good"),
      row("WebRTC fixed", "Network", ShieldCheck, webRtc.status === "checking" ? "Checking for leaks…" : hasWebRtcLeak ? "Potential public IP leak" : "No leak detected", webRtc.status === "checking" ? "Analyzing" : hasWebRtcLeak ? "Review" : "Clear", webRtc.status === "checking" ? "neutral" : hasWebRtcLeak ? "warn" : "good"),
      row("TCP/IP Fingerprint", "Server Signal", Activity, "Unavailable — origin-authorized SYN inspection required", "Not evaluable", "neutral"),
      row("Anonymizer / Proxy / VPN", "Security", ShieldCheck, proxySignals ? isProxy ? "Detected" : "No" : ipInfo.success ? "Not evaluated" : "Collecting…", proxySignals ? isProxy ? "Review" : "Clear" : ipInfo.success ? "Unavailable" : "Analyzing", proxySignals ? isProxy ? "warn" : "good" : "neutral"),
      profileRow("Browser", "Browser", Monitor, browserName),
      profileRow("Operating System", "System", Monitor, operatingSystem ? `${operatingSystem} · ${displayValue(browser.architecture, "Architecture hidden")}` : undefined),
      profileRow("Device Type", "System", Monitor, browser.device),
      profileRow("Screen Resolution", "System", ScanLine, browser.screen),
      profileRow("Browser Timezone", "System", CircleGauge, browser.timezone),
      profileRow("Canvas Signature", "Canvas", Fingerprint, browser.canvasHash, "High similarity"),
      profileRow("GPU Renderer", "Hardware", Cpu, browser.gpuRenderer, "High similarity"),
      row("Audio Context", "System", AudioLines, audioDiagnostic?.summary || "Collecting…", !browserReady ? "Analyzing" : audioDiagnostic?.status === "ok" ? "Clear" : "Review", !browserReady ? "neutral" : audioDiagnostic?.status === "ok" ? "good" : "warn"),
      profileRow("Platform", "System", Boxes, browser.platform),
    ];

    const headerRow = (attribute: string, header: string, icon: typeof Globe2 = Braces) => {
      const value = httpHeaders.headers[header];
      return row(
        attribute,
        "Request Header",
        icon,
        httpHeaders.status === "loading" ? "Collecting…" : value || "Not sent",
        httpHeaders.status === "loading" ? "Analyzing" : value ? "Live" : "Not sent",
        httpHeaders.status === "loading" ? "neutral" : value ? "good" : "neutral",
      );
    };
    const httpHeaderRows: SummaryRow[] = [
      headerRow("User-Agent", "user-agent"),
      headerRow("Accept", "accept"),
      headerRow("Accept-Encoding", "accept-encoding"),
      headerRow("Accept-Language", "accept-language", Languages),
      headerRow("Sec-CH-UA", "sec-ch-ua"),
      headerRow("Sec-CH-UA-Mobile", "sec-ch-ua-mobile", Monitor),
      headerRow("Sec-CH-UA-Platform", "sec-ch-ua-platform", Monitor),
      headerRow("Sec-Fetch-Dest", "sec-fetch-dest"),
      headerRow("Sec-Fetch-Mode", "sec-fetch-mode"),
      headerRow("Sec-Fetch-Site", "sec-fetch-site"),
      headerRow("Upgrade-Insecure-Requests", "upgrade-insecure-requests"),
      headerRow("Connection", "connection", Network),
      headerRow("Host", "host", Network),
      profileRow("Do Not Track", "Privacy", ShieldCheck, browser.doNotTrack),
      availabilityRow("Cookies", "HTTP", Cookie, browserReady ? browser.cookies : undefined, "Enabled", "Disabled"),
      availabilityRow("Online State", "Network", Wifi, online, "Online", "Offline"),
      profileRow("Platform", "Navigator", Boxes, browser.platform),
    ];

    const browserRows: SummaryRow[] = [
      profileRow("Browser", "Browser", Monitor, browserName),
      profileRow("Browser Version", "Browser", Monitor, browser.browserVersion),
      profileRow("Rendering Engine", "Runtime", Boxes, browser.engine),
      row("App Version", "Navigator", Braces, displayValue(formatUnknown(readModuleValue(navigatorModule, "appVersion"))), navigatorModule ? "Live" : "Analyzing", navigatorModule ? "good" : "neutral"),
      row("Vendor", "Navigator", Braces, displayValue(formatUnknown(readModuleValue(navigatorModule, "vendor"))), navigatorModule ? "Live" : "Analyzing", navigatorModule ? "good" : "neutral"),
      profileRow("User-Agent", "Navigator", Braces, browser.userAgent),
      profileRow("Primary Language", "Locale", Languages, browser.language),
      profileRow("Languages", "Locale", Languages, browser.languages.join(", ")),
      availabilityRow("Cookies", "Privacy", Cookie, browserReady ? browser.cookies : undefined, "Enabled", "Disabled"),
      profileRow("Do Not Track", "Privacy", ShieldCheck, browser.doNotTrack),
      availabilityRow("PDF Viewer", "Navigator", Braces, readBoolean(navigatorModule, "pdfViewerEnabled")),
      availabilityRow("Online State", "Navigator", Wifi, readBoolean(navigatorModule, "onLine"), "Online", "Offline"),
      row("Plugins", "Navigator", Braces, formatUnknown(readModuleValue(navigatorModule, "plugins")) || "None exposed", navigatorModule ? "Live" : "Analyzing", navigatorModule ? "good" : "neutral"),
      row("Plugin Count", "Navigator", Braces, formatUnknown(readModuleValue(navigatorModule, "pluginsCount")) || "0", navigatorModule ? "Live" : "Analyzing", navigatorModule ? "good" : "neutral"),
      row("MIME Types", "Navigator", Braces, formatUnknown(readModuleValue(navigatorModule, "mimeTypes")) || "None exposed", navigatorModule ? "Live" : "Analyzing", navigatorModule ? "good" : "neutral"),
      row("Navigator Properties", "Runtime", Braces, formatUnknown(readModuleValue(navigatorModule, "propertiesCount")) || "Collecting…", navigatorModule ? "Live" : "Analyzing", navigatorModule ? "good" : "neutral"),
      row("UA-CH Brands", "Client Hint", Braces, formatUnknown(uaHints?.brands) || "Not exposed", navigatorModule ? "Live" : "Analyzing", navigatorModule ? "good" : "neutral"),
      row("UA-CH Full Versions", "Client Hint", Braces, formatUnknown(uaHints?.fullVersionList) || formatUnknown(readModuleValue(browserVersionModule, "version")) || "Not exposed", browserVersionModule ? "Live" : "Analyzing", browserVersionModule ? "good" : "neutral"),
      row("Platform Version", "Client Hint", Monitor, formatUnknown(uaHints?.platformVersion) || "Not exposed", navigatorModule ? "Live" : "Analyzing", navigatorModule ? "good" : "neutral"),
      row("Architecture / Bitness", "Client Hint", Cpu, [formatUnknown(uaHints?.architecture), formatUnknown(uaHints?.bitness)].filter(Boolean).join(" / ") || browser.architecture, navigatorModule ? "Live" : "Analyzing", navigatorModule ? "good" : "neutral"),
      row("Permissions", "Privacy", ShieldCheck, permissionSummary ? `granted ${Array.isArray(permissionSummary.granted) ? permissionSummary.granted.length : 0} · prompt ${Array.isArray(permissionSummary.prompt) ? permissionSummary.prompt.length : 0} · denied ${Array.isArray(permissionSummary.denied) ? permissionSummary.denied.length : 0}` : "Collecting…", navigatorModule ? "Live" : "Analyzing", navigatorModule ? "good" : "neutral"),
      availabilityRow("WebGPU", "Graphics", Boxes, typeof webGpu?.available === "boolean" ? webGpu.available : undefined),
      availabilityRow("WebDriver", "Automation", ShieldCheck, browserReady ? !browser.webdriver : undefined, "Not detected", "Detected"),
      row("Headless Signals", "Automation", ShieldCheck, readBoolean(headlessModule, "automated") === undefined ? "Collecting…" : readBoolean(headlessModule, "automated") ? "Detected" : "Not detected", headlessModule ? readBoolean(headlessModule, "automated") ? "Review" : "Clear" : "Analyzing", headlessModule && readBoolean(headlessModule, "automated") ? "warn" : headlessModule ? "good" : "neutral"),
      row("Automation Verdict", "Automation", ShieldCheck, readBoolean(automationModule, "isAutomated") === undefined ? "Collecting…" : readBoolean(automationModule, "isAutomated") ? "Automated" : "Human-like", automationModule ? readBoolean(automationModule, "isAutomated") ? "Review" : "Clear" : "Analyzing", automationModule && readBoolean(automationModule, "isAutomated") ? "warn" : automationModule ? "good" : "neutral"),
    ];

    const screenRows: SummaryRow[] = [
      profileRow("Screen Resolution", "Display", ScanLine, browser.screen),
      profileRow("Available Screen", "Display", ScanLine, availableScreen),
      profileRow("Viewport", "Layout", Monitor, viewport),
      profileRow("Outer Window", "Layout", Monitor, outerWindow),
      profileRow("Color Depth", "Display", ImageIcon, browserReady ? `${browser.colorDepth}-bit` : undefined),
      row("Pixel Depth", "Display", ImageIcon, formatUnknown(readModuleValue(screenModule, "pixelDepth")) || "Collecting…", screenModule ? "Live" : "Analyzing", screenModule ? "good" : "neutral"),
      profileRow("Pixel Ratio", "Display", ScanLine, browserReady ? `${browser.pixelRatio}×` : undefined),
      row("Orientation", "Display", ScanLine, formatUnknown(readModuleValue(screenModule, "orientation")) || formatUnknown(readModuleValue(cssMediaModule, "orientation")) || "Collecting…", screenModule ? "Live" : "Analyzing", screenModule ? "good" : "neutral"),
      profileRow("Touch Points", "Input", Monitor, browserReady ? String(browser.touchPoints) : undefined),
      row("Color Scheme", "CSS Media", ImageIcon, formatUnknown(readModuleValue(cssMediaModule, "colorScheme")) || "Collecting…", cssMediaModule ? "Live" : "Analyzing", cssMediaModule ? "good" : "neutral"),
      row("Reduced Motion", "CSS Media", Activity, formatUnknown(readModuleValue(cssMediaModule, "reducedMotion")) || "Collecting…", cssMediaModule ? "Live" : "Analyzing", cssMediaModule ? "good" : "neutral"),
      row("Forced Colors", "CSS Media", ImageIcon, formatUnknown(readModuleValue(cssMediaModule, "forcedColors")) || "Collecting…", cssMediaModule ? "Live" : "Analyzing", cssMediaModule ? "good" : "neutral"),
      row("Hover / Any Hover", "CSS Media", Monitor, [formatUnknown(readModuleValue(cssMediaModule, "hover")), formatUnknown(readModuleValue(cssMediaModule, "anyHover"))].filter(Boolean).join(" / ") || "Collecting…", cssMediaModule ? "Live" : "Analyzing", cssMediaModule ? "good" : "neutral"),
      row("Pointer / Any Pointer", "CSS Media", Monitor, [formatUnknown(readModuleValue(cssMediaModule, "pointer")), formatUnknown(readModuleValue(cssMediaModule, "anyPointer"))].filter(Boolean).join(" / ") || "Collecting…", cssMediaModule ? "Live" : "Analyzing", cssMediaModule ? "good" : "neutral"),
      row("Color Gamut", "CSS Media", ImageIcon, formatUnknown(readModuleValue(cssMediaModule, "colorGamut")) || "Collecting…", cssMediaModule ? "Live" : "Analyzing", cssMediaModule ? "good" : "neutral"),
      row("Display Mode", "CSS Media", Monitor, formatUnknown(readModuleValue(cssMediaModule, "displayMode")) || "Collecting…", cssMediaModule ? "Live" : "Analyzing", cssMediaModule ? "good" : "neutral"),
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
      availabilityRow("WebGL 1", "Graphics", Boxes, readBoolean(webGlModule, "webgl1")),
      availabilityRow("WebGL 2", "Graphics", Boxes, readBoolean(webGlModule, "webgl2")),
      row("WebGL Version", "Graphics", Boxes, formatUnknown(readModuleValue(webGlModule, "version")) || "Collecting…", webGlModule ? "Live" : "Analyzing", webGlModule ? "good" : "neutral"),
      row("Max Texture Size", "Graphics", Boxes, formatUnknown(readModuleValue(webGlModule, "maxTextureSize")) || "Collecting…", webGlModule ? "Live" : "Analyzing", webGlModule ? "good" : "neutral"),
      row("Max Renderbuffer", "Graphics", Boxes, formatUnknown(readModuleValue(webGlModule, "maxRenderbufferSize")) || "Collecting…", webGlModule ? "Live" : "Analyzing", webGlModule ? "good" : "neutral"),
      availabilityRow("WebGPU", "Graphics", Boxes, typeof webGpu?.available === "boolean" ? webGpu.available : undefined),
      availabilityRow("Battery API", "Power", Activity, readBoolean(batteryModule, "apiAvailable")),
      row("Battery Level", "Power", Activity, typeof readModuleValue(batteryModule, "level") === "number" ? `${readModuleValue(batteryModule, "level")}%` : "Not exposed", batteryModule ? "Live" : "Analyzing", batteryModule ? "good" : "neutral"),
      row("Battery Charging", "Power", Activity, formatUnknown(readModuleValue(batteryModule, "charging")) || "Not exposed", batteryModule ? "Live" : "Analyzing", batteryModule ? "good" : "neutral"),
    ];

    const canvasRows: SummaryRow[] = [
      profileRow("Canvas Signature", "Canvas", Fingerprint, browser.canvasHash, "High similarity"),
      row("Hash Algorithm", "Canvas", Fingerprint, "SHA-256", canvasModule ? "Collected" : "Analyzing", canvasModule ? "good" : "neutral"),
      row("Render / Readability", "Canvas", ImageIcon, canvasDiagnostic?.detail || "Collecting…", canvasDiagnostic?.status === "ok" ? "Clear" : browserReady ? "Review" : "Analyzing", canvasDiagnostic?.status === "ok" ? "good" : browserReady ? "warn" : "neutral"),
      availabilityRow("Canvas 2D", "Canvas", ImageIcon, readBoolean(canvasModule, "available")),
      availabilityRow("Stable Renders (3×)", "Canvas", Activity, readBoolean(canvasModule, "stableRenders"), "Stable", "Unstable"),
      row("Data URL Length", "Canvas", ImageIcon, formatUnknown(readModuleValue(canvasModule, "dataURILength")) || "Collecting…", canvasModule ? "Live" : "Analyzing", canvasModule ? "good" : "neutral"),
      profileRow("Color Surface", "Canvas", ImageIcon, browserReady ? `${browser.colorDepth}-bit color depth · ${browser.screen}` : undefined),
      row("Client Rect Width", "Geometry", ScanLine, formatUnknown(readModuleValue(rectsModule, "width")) || "Collecting…", rectsModule ? "Live" : "Analyzing", rectsModule ? "good" : "neutral"),
      row("Client Rect Height", "Geometry", ScanLine, formatUnknown(readModuleValue(rectsModule, "height")) || "Collecting…", rectsModule ? "Live" : "Analyzing", rectsModule ? "good" : "neutral"),
      row("Client Rect Module", "Module", Fingerprint, rectsModule?.hash || "Collecting…", rectsModule ? "Live" : "Analyzing", rectsModule ? "good" : "neutral"),
      row("Canvas Module Hash", "Module", Fingerprint, canvasModule?.hash || "Collecting…", canvasModule ? "Live" : "Analyzing", canvasModule ? "good" : "neutral"),
    ];

    const webGlRows: SummaryRow[] = [
      availabilityRow("WebGL", "Graphics", Boxes, browserReady ? browser.webgl : undefined),
      availabilityRow("WebGL 1", "Graphics", Boxes, readBoolean(webGlModule, "webgl1")),
      availabilityRow("WebGL 2", "Graphics", Boxes, readBoolean(webGlModule, "webgl2")),
      row("WebGL Version", "Graphics", Boxes, formatUnknown(readModuleValue(webGlModule, "version")) || "Collecting…", webGlModule ? "Live" : "Analyzing", webGlModule ? "good" : "neutral"),
      row("Shading Language", "Graphics", Braces, formatUnknown(readModuleValue(webGlModule, "shadingLanguage")) || "Collecting…", webGlModule ? "Live" : "Analyzing", webGlModule ? "good" : "neutral"),
      profileRow("GPU Vendor", "Graphics", Cpu, browser.gpuVendor),
      profileRow("GPU Renderer", "Graphics", Cpu, browser.gpuRenderer),
      availabilityRow("Antialias", "Context", ImageIcon, readBoolean(webGlModule, "antialias")),
      row("Extensions Count", "Extensions", Boxes, formatUnknown(readModuleValue(webGlModule, "extensionsCount")) || "Collecting…", webGlModule ? "Live" : "Analyzing", webGlModule ? "good" : "neutral"),
      row("Extensions", "Extensions", Boxes, formatUnknown(readModuleValue(webGlModule, "extensions")) || "Not exposed", webGlModule ? "Live" : "Analyzing", webGlModule ? "good" : "neutral"),
      row("Max Texture Size", "Limits", Boxes, formatUnknown(readModuleValue(webGlModule, "maxTextureSize")) || "Collecting…", webGlModule ? "Live" : "Analyzing", webGlModule ? "good" : "neutral"),
      row("Max Renderbuffer Size", "Limits", Boxes, formatUnknown(readModuleValue(webGlModule, "maxRenderbufferSize")) || "Collecting…", webGlModule ? "Live" : "Analyzing", webGlModule ? "good" : "neutral"),
      row("Max Viewport Dimensions", "Limits", Monitor, formatUnknown(readModuleValue(webGlModule, "maxViewportDims")) || "Collecting…", webGlModule ? "Live" : "Analyzing", webGlModule ? "good" : "neutral"),
      availabilityRow("WebGPU", "Graphics", Boxes, typeof webGpu?.available === "boolean" ? webGpu.available : undefined),
      row("Canvas WebGL Module", "Module", Fingerprint, webGlModule?.hash || "Collecting…", webGlModule ? webGlModule.issues ? `${webGlModule.issues} issue(s)` : "Clear" : "Analyzing", webGlModule ? webGlModule.issues ? "warn" : "good" : "neutral"),
    ];

    const displayedFonts = detectedFonts.length ? detectedFonts : browser.fonts;
    const fontRows: SummaryRow[] = displayedFonts.length
      ? [
          row("Detected Fonts", "Fonts", Type, String(displayedFonts.length), "Live", "good"),
          row("Detection Method", "Fonts", Type, formatUnknown(readModuleValue(fontsModule, "method")) || "Browser capability check", "Live", "good"),
          row("Reported Platform", "Fonts", Monitor, formatUnknown(readModuleValue(fontsModule, "platform")) || browser.platform, "Live", "good"),
          ...displayedFonts.map((font) => row(font, "Detected Font", Type, "Available", "Exact match", "good")),
          row("Fonts Module Hash", "Module", Fingerprint, fontsModule?.hash || "Collecting…", fontsModule ? "Live" : "Analyzing", fontsModule ? "good" : "neutral"),
        ]
      : [
          row("Detected Fonts", "Fonts", Type, browserReady ? "Font enumeration unavailable or blocked" : "Collecting…", browserReady ? "Unavailable" : "Analyzing", browserReady ? "warn" : "neutral"),
        ];

    const mediaRows: SummaryRow[] = [
      availabilityRow("AudioContext", "Audio", AudioLines, audioSupported, audioDiagnostic?.summary || "Available", audioDiagnostic?.summary || "Unavailable"),
      availabilityRow("OfflineAudioContext", "Audio", AudioLines, readBoolean(audioModule, "offlineAudioContext")),
      row("Audio Sample Rate", "Audio", AudioLines, typeof readModuleValue(audioModule, "sampleRate") === "number" ? `${readModuleValue(audioModule, "sampleRate")} Hz` : "Not exposed", audioModule ? "Live" : "Analyzing", audioModule ? "good" : "neutral"),
      row("Rendered Sample Rate", "Audio", AudioLines, typeof readModuleValue(audioModule, "renderedSampleRate") === "number" ? `${readModuleValue(audioModule, "renderedSampleRate")} Hz` : "Not exposed", audioModule ? "Live" : "Analyzing", audioModule ? "good" : "neutral"),
      row("Audio Sample Sum", "Audio", AudioLines, formatUnknown(readModuleValue(audioModule, "sampleSum")) || "Not exposed", audioModule ? "Live" : "Analyzing", audioModule ? "good" : "neutral"),
      row("Unique Audio Samples", "Audio", AudioLines, formatUnknown(readModuleValue(audioModule, "totalUniqueSamples")) || "Not exposed", audioModule ? "Live" : "Analyzing", audioModule ? "good" : "neutral"),
      availabilityRow("MediaSource", "Media", Radio, mediaSource),
      availabilityRow("MediaRecorder", "Media", Radio, mediaRecorder),
      availabilityRow("Media Devices", "Media", Radio, readBoolean(mediaModule, "mediaDevices")),
      row("SpeechSynthesis", "Speech", AudioLines, speechAvailable === undefined ? "Collecting…" : speechAvailable ? `${typeof voiceCount === "number" ? voiceCount : 0} voice(s) detected` : "Unavailable", speechAvailable === undefined ? "Analyzing" : speechAvailable ? "Available" : "Unavailable", speechAvailable === undefined ? "neutral" : speechAvailable ? "good" : "warn"),
      row("Voice Languages", "Speech", Languages, formatUnknown(readModuleValue(voicesModule, "languages")) || "None exposed", voicesModule ? "Live" : "Analyzing", voicesModule ? "good" : "neutral"),
      row("Default Voice", "Speech", AudioLines, [formatUnknown(readModuleValue(voicesModule, "defaultVoiceName")), formatUnknown(readModuleValue(voicesModule, "defaultVoiceLang"))].filter(Boolean).join(" · ") || "None exposed", voicesModule ? "Live" : "Analyzing", voicesModule ? "good" : "neutral"),
      row("Navigator MIME Types", "Media", Braces, formatUnknown(readModuleValue(mediaModule, "mimeTypes")) || "None exposed", mediaModule ? "Live" : "Analyzing", mediaModule ? "good" : "neutral"),
      row("MP3 Playback", "Codec", Radio, formatUnknown(mediaFormats?.mp3) || "Not supported", mediaModule ? "Live" : "Analyzing", mediaModule ? "good" : "neutral"),
      row("AAC Playback", "Codec", Radio, formatUnknown(mediaFormats?.aac) || "Not supported", mediaModule ? "Live" : "Analyzing", mediaModule ? "good" : "neutral"),
      row("WebM Video", "Codec", Radio, formatUnknown(mediaFormats?.webmVideo) || "Not supported", mediaModule ? "Live" : "Analyzing", mediaModule ? "good" : "neutral"),
      row("WebM Audio", "Codec", Radio, formatUnknown(mediaFormats?.webmAudio) || "Not supported", mediaModule ? "Live" : "Analyzing", mediaModule ? "good" : "neutral"),
      row("Network Media Status", "Media", Wifi, networkDiagnostic?.summary || "Collecting…", networkDiagnostic?.status === "ok" ? "Clear" : browserReady ? "Review" : "Analyzing", networkDiagnostic?.status === "ok" ? "good" : browserReady ? "warn" : "neutral"),
    ];

    const storageRows: SummaryRow[] = [
      availabilityRow("Local Storage", "Storage", Database, browserReady ? localStorageAvailable : undefined),
      availabilityRow("Session Storage", "Storage", Database, readBoolean(storageModule, "sessionStorage")),
      availabilityRow("IndexedDB", "Storage", HardDrive, indexedDb),
      availabilityRow("Cache Storage", "Storage", Database, readBoolean(storageModule, "cacheStorage")),
      availabilityRow("Service Worker", "Storage", Database, readBoolean(storageModule, "serviceWorker")),
      availabilityRow("StorageManager", "Storage", Database, readBoolean(storageModule, "apiAvailable")),
      row("Storage Quota", "StorageManager", HardDrive, formatBytes(readModuleValue(storageModule, "quotaBytes")) || "Not exposed", storageModule ? "Live" : "Analyzing", storageModule ? "good" : "neutral"),
      row("Storage Usage", "StorageManager", HardDrive, formatBytes(readModuleValue(storageModule, "usageBytes")) || "Not exposed", storageModule ? "Live" : "Analyzing", storageModule ? "good" : "neutral"),
      row("Usage Percentage", "StorageManager", HardDrive, typeof readModuleValue(storageModule, "usagePercent") === "number" ? `${readModuleValue(storageModule, "usagePercent")}%` : "Not exposed", storageModule ? "Live" : "Analyzing", storageModule ? "good" : "neutral"),
      availabilityRow("Persistent Storage", "StorageManager", HardDrive, readBoolean(storageModule, "persistent"), "Persisted", "Not persisted"),
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
      "full-json": [],
    };
  }, [boundedRiskScore, browser, browserReady, diagnostics, httpHeaders, ipInfo, ipRisk, modules, webRtc]);

  const activeCopy = categoryCopy[activeCategory];
  const activeRows = rowsByCategory[activeCategory];
  const isFullJson = activeCategory === "full-json";
  const moduleTotal = fingerprintModuleKeys.length;
  const payloadSize = fullJsonReady ? formatPayloadSize(fullJson) : "Calculating…";

  const handleCategoryKeyDown = (event: KeyboardEvent<HTMLButtonElement>, key: CategoryKey) => {
    const currentIndex = categories.findIndex((category) => category.key === key);
    let nextIndex: number | undefined;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = categories.length - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % categories.length;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + categories.length) % categories.length;
    }
    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextCategory = categories[nextIndex];
    setActiveCategory(nextCategory.key);
    window.requestAnimationFrame(() => {
      document.getElementById(`fingerprint-tab-${nextCategory.key}`)?.focus();
    });
  };

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
            onKeyDown={(event) => handleCategoryKeyDown(event, key)}
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
        tabIndex={0}
      >
        <header className={styles.workspaceHeader}>
          <div>
            <h2 id="fingerprint-overview-title">{activeCopy.title}</h2>
            <p>{activeCopy.subtitle}</p>
          </div>
          <div className={styles.analysisMeta}>
            {isFullJson ? (
              <>
                <span>Modules: {collectedModuleCount} / {moduleTotal}</span>
                <span>Payload: {payloadSize}</span>
                <span>Status: {fullJsonReady ? "Ready" : "Collecting"}</span>
              </>
            ) : (
              <>
                <span>Analysis ID: {fingerprintId}</span>
                <span>Browser score: {scoreText(browserScore)}</span>
                <span>Analyzed: just now</span>
              </>
            )}
          </div>
        </header>

        <div className={styles.metrics}>
          <div className={styles.idMetric}>
            <span>Fingerprint ID</span>
            <Fingerprint aria-hidden="true" size={13} />
            <strong>{fingerprintId}</strong>
          </div>
          {isFullJson ? (
            <>
              <div className={styles.metricCard}>
                <Boxes aria-hidden="true" size={15} />
                <span>Module count</span>
                <strong className={fullJsonReady ? styles.goodText : styles.neutralText}>
                  {collectedModuleCount} / {moduleTotal}
                </strong>
              </div>
              <div className={styles.metricCard}>
                <FileJson aria-hidden="true" size={15} />
                <span>Format</span>
                <strong>JSON</strong>
              </div>
              <div className={styles.metricCard}>
                <Hash aria-hidden="true" size={15} />
                <span>Hashing</span>
                <strong>SHA-256</strong>
              </div>
              <div className={styles.metricCard}>
                <ShieldCheck aria-hidden="true" size={15} />
                <span>Status</span>
                <strong className={fullJsonReady ? styles.goodText : styles.neutralText}>
                  {fullJsonReady ? "Ready" : "Collecting"}
                </strong>
                {fullJsonReady ? <CircleCheck aria-hidden="true" className={styles.metricCheck} size={14} /> : null}
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {isFullJson ? (
          <div
            aria-busy={!fullJsonReady}
            aria-label="Full fingerprint JSON payload"
            className={styles.jsonViewer}
          >
            <div className={styles.jsonToolbar}>
              <span>30-module payload</span>
              <div className={styles.jsonActions}>
                <button
                  className={copied === "json" ? styles.jsonActionCopied : styles.jsonAction}
                  disabled={!fullJsonReady}
                  onClick={onCopyJson}
                  type="button"
                >
                  <Clipboard aria-hidden="true" />
                  {copied === "json" ? "Copied" : "Copy JSON"}
                </button>
                <button
                  className={styles.jsonAction}
                  disabled={!fullJsonReady}
                  onClick={onDownloadJson}
                  type="button"
                >
                  <Download aria-hidden="true" />
                  Download JSON
                </button>
              </div>
            </div>
            {fullJsonReady ? (
              <pre className={styles.jsonCode}><code>{fullJson}</code></pre>
            ) : (
              <div className={styles.jsonLoading} role="status" aria-live="polite">
                <Activity aria-hidden="true" />
                <strong>Collecting fingerprint modules…</strong>
                <span>{collectedModuleCount} of {moduleTotal} modules ready.</span>
              </div>
            )}
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}
