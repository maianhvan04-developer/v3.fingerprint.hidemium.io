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

export type FingerprintProvider = "fingerprint-pro" | "fingerprintjs" | "local";

export interface FingerprintIdentity {
  confidence: number | null;
  provider: FingerprintProvider;
  requestId: string | null;
  visitorFound: boolean | null;
  visitorId: string;
}

export interface FingerprintSmartSignals {
  bot: boolean | null;
  developerTools: boolean | null;
  highActivityDevice: boolean | null;
  incognito: boolean | null;
  ipBlocklist: boolean | null;
  privacySettings: boolean | null;
  rareDevice: boolean | null;
  tampering: boolean | null;
  virtualMachine: boolean | null;
}

export interface FingerprintServerEvent {
  asn: string | null;
  bot: boolean | null;
  browserName: string | null;
  browserVersion: string | null;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  developerTools: boolean | null;
  device: string | null;
  highActivityDevice: boolean | null;
  hosting: boolean | null;
  incognito: boolean | null;
  ipAddress: string | null;
  ipBlocklist: boolean | null;
  isp: string | null;
  latitude: number | null;
  longitude: number | null;
  os: string | null;
  osVersion: string | null;
  privacySettings: boolean | null;
  proxy: boolean | null;
  rareDevice: boolean | null;
  suspectScore: number | null;
  tampering: boolean | null;
  timezone: string | null;
  tor: boolean | null;
  virtualMachine: boolean | null;
  vpn: boolean | null;
  visitorId: string | null;
}

export interface FingerprintSnapshot {
  browser: BrowserFingerprint;
  collectedAt: string;
  compositeHash: string;
  headers: Record<string, string>;
  identity: FingerprintIdentity;
  network: NetworkFingerprint;
  privacy: PrivacyFingerprint;
  scores: FingerprintScores;
  screen: ScreenFingerprint;
  sessionId: string;
  signals: SignalFingerprint;
  smartSignals: FingerprintSmartSignals;
  status: ScanStatus;
  system: SystemFingerprint;
}

export interface VisitorVisitRecord {
  browserName: string;
  browserVersion: string;
  city: string;
  collectedAt: string;
  countryCode: string;
  incognito: boolean;
  ipAddress: string;
  latitude: number | null;
  longitude: number | null;
  requestId: string | null;
  vpn: boolean | null;
}

export interface VisitorHistoryData {
  visitorId: string;
  visits: VisitorVisitRecord[];
}

export interface VisitorHistorySummary {
  incognitoSessions: number;
  uniqueIps: number;
  uniqueLocations: number;
  visitCount: number;
}
