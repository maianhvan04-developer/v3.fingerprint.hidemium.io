export type AuditFilter = "all" | "fail" | "fatal" | "skip";
export type AuditStatus = "pass" | "warn" | "fatal" | "skip";
export type CopyKind = "ip" | "json";
export type DiagnosticStatus = "ok" | "warning" | "error";
export type Language = "EN" | "VI" | "CN" | "RU";

export const fingerprintModuleKeys = [
  "workerScope",
  "navigator",
  "browserVersion",
  "windowFeatures",
  "headless",
  "htmlElementVersion",
  "cssMedia",
  "css",
  "screen",
  "voices",
  "media",
  "canvas2d",
  "cpuScaling",
  "canvasWebgl",
  "maths",
  "consoleErrors",
  "timezone",
  "clientRects",
  "offlineAudioContext",
  "fonts",
  "capturedErrors",
  "svg",
  "resistance",
  "intl",
  "features",
  "proxyLies",
  "network",
  "battery",
  "storage",
  "automation",
] as const;

export type FingerprintModuleKey = (typeof fingerprintModuleKeys)[number];

export interface AuditItem {
  detail: string;
  id: string;
  name: string;
  status: AuditStatus;
}

export type AuditCounts = Record<AuditStatus, number>;

export interface BrowserProfile {
  architecture: string;
  browser: string;
  browserVersion: string;
  canvasHash: string;
  colorDepth: number;
  connection: string;
  cookies: boolean;
  device: string;
  deviceMemory: string;
  doNotTrack: string;
  engine: string;
  fonts: string[];
  gpuRenderer: string;
  gpuVendor: string;
  hardwareConcurrency: number;
  language: string;
  languages: string[];
  os: string;
  osVersion: string;
  pixelRatio: number;
  platform: string;
  screen: string;
  storage: boolean;
  timezone: string;
  touchPoints: number;
  userAgent: string;
  webdriver: boolean;
  webgl: boolean;
}

export interface DiagnosticCard {
  detail: string;
  name: string;
  status: DiagnosticStatus;
  summary: string;
}

export interface FingerprintModule {
  description: string;
  hash: string;
  issues: number;
  key: FingerprintModuleKey;
  name: string;
  result: Record<string, unknown>;
}

export interface HttpHeadersSnapshot {
  headers: Record<string, string>;
  status: "loading" | "complete" | "unavailable";
}

export interface IpRiskProfile {
  score?: number;
  status: "loading" | "complete" | "unavailable";
  verdict?: string;
}

export interface IpLookupResponse {
  success?: boolean;
  ip?: string;
  ipv4?: string;
  ipv6?: string;
  type?: string;
  country?: string;
  country_code?: string;
  continent?: string;
  region?: string;
  region_code?: string;
  city?: string;
  postal?: string;
  airport?: string;
  languages?: string[];
  latitude?: number;
  longitude?: number;
  flag?: { emoji?: string };
  connection?: {
    asn?: number;
    org?: string;
    isp?: string;
    domain?: string;
  };
  timezone?: {
    id?: string;
    current_time?: string;
  };
  security?: {
    anonymous?: boolean;
    hosting?: boolean;
    proxy?: boolean;
    tor?: boolean;
    vpn?: boolean;
  };
}

export interface Translation {
  languageName: string;
  badge: string;
  browserScore: string;
  copied: string;
  copyIp: string;
  details: string;
  diagnostics: string;
  diagnosticsSub: string;
  ipRisk: string;
  myIp: string;
  navigation: {
    antidetectBrowser: string;
    closeNavigation: string;
    contacts: string;
    language: string;
    logIn: string;
    openNavigation: string;
    proxy: string;
    signUp: string;
  };
}

export interface WebRtcResult {
  candidates: string[];
  ips: string[];
  session: string;
  status: "checking" | "complete" | "unavailable";
}

export interface OverviewRow {
  attribute: string;
  category: "Network" | "Browser" | "System" | "Hardware" | "Privacy";
  result: "Clear" | "Exact match" | "High similarity" | "Live";
  tone: "good" | "warn";
  value: string;
}
