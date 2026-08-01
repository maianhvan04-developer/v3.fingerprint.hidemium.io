export type AuditFilter = "all" | "fail" | "fatal" | "skip";
export type AuditStatus = "pass" | "warn" | "fatal" | "skip";
export type CopyKind = "ip" | "json";
export type DiagnosticStatus = "ok" | "warning" | "error";
export type Language = "EN" | "VI" | "CN" | "RU";

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
  name: string;
  result: Record<string, unknown>;
}

export interface IpLookupResponse {
  success?: boolean;
  ip?: string;
  type?: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  postal?: string;
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
}

export interface WebRtcResult {
  candidates: string[];
  ips: string[];
  session: string;
  status: "checking" | "complete" | "unavailable";
}
