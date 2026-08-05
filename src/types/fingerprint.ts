export type ScanStatus = "collecting" | "complete" | "partial";

export type ValueTone = "default" | "good" | "warn" | "accent";

export interface FingerprintRow {
  label: string;
  tone?: ValueTone;
  value: string;
}

export interface NetworkFingerprint {
  asn: string;
  city: string;
  connectionType: string;
  country: string;
  countryCode: string;
  dnsLeak: string;
  hosting: boolean | null;
  ipAddress: string;
  ipReputation: string;
  ipVersion: string;
  isp: string;
  latitude: number | null;
  longitude: number | null;
  proxy: boolean | null;
  timezone: string;
  tor: boolean | null;
  vpn: boolean | null;
  webRtcAddresses: string[];
}

export interface BrowserFingerprint {
  cookies: boolean;
  doNotTrack: string;
  engine: string;
  indexedDb: boolean;
  language: string;
  languages: string[];
  localStorage: boolean;
  name: string;
  plugins: string[];
  referrer: string;
  sessionStorage: boolean;
  userAgent: string;
  version: string;
}

export interface SystemFingerprint {
  architecture: string;
  battery: string;
  cpu: string;
  deviceMemory: string;
  gpu: string;
  hardwareConcurrency: number;
  os: string;
  osVersion: string;
  platform: string;
  touchSupport: string;
  uptime: string;
}

export interface ScreenFingerprint {
  availableResolution: string;
  colorDepth: string;
  devicePixelRatio: string;
  hdr: string;
  orientation: string;
  pixelDepth: string;
  refreshRate: string;
  resolution: string;
  viewport: string;
  zoomLevel: string;
}

export interface SignalFingerprint {
  audioHash: string;
  canvasHash: string;
  fontCount: number;
  fonts: string[];
  mediaDeviceCount: number;
  mimeTypeCount: number;
  notificationPermission: string;
  pluginCount: number;
  speechSynthesis: string;
  webGlRenderer: string;
  webGlVendor: string;
  webGlVersion: string;
}

export interface PrivacyFingerprint {
  adBlocker: string;
  automationFlags: string;
  cameraPermission: string;
  crossOriginIsolation: string;
  geolocationPermission: string;
  headless: string;
  microphonePermission: string;
  permissionsPolicy: string;
  webDriver: string;
  webRtc: string;
}

export interface FingerprintScores {
  anonymityLabel: string;
  anonymityScore: number;
  consistency: number;
  coverage: number;
  riskLabel: string;
  riskScore: number;
  uniqueness: number;
}

export interface FingerprintSnapshot {
  browser: BrowserFingerprint;
  collectedAt: string;
  compositeHash: string;
  headers: Record<string, string>;
  network: NetworkFingerprint;
  privacy: PrivacyFingerprint;
  scores: FingerprintScores;
  screen: ScreenFingerprint;
  sessionId: string;
  signals: SignalFingerprint;
  status: ScanStatus;
  system: SystemFingerprint;
}
