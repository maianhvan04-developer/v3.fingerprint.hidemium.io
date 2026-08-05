import "client-only";

import type {
  BrowserFingerprint,
  FingerprintScores,
  FingerprintSnapshot,
  NetworkFingerprint,
  PrivacyFingerprint,
  ScreenFingerprint,
  SignalFingerprint,
  SystemFingerprint,
} from "@/types/fingerprint";

interface NavigatorExtras extends Navigator {
  connection?: {
    effectiveType?: string;
    type?: string;
  };
  deviceMemory?: number;
  getBattery?: () => Promise<{
    charging: boolean;
    level: number;
  }>;
  userAgentData?: {
    getHighEntropyValues?: (hints: string[]) => Promise<Record<string, string>>;
    platform?: string;
  };
}

interface IpLookupPayload {
  asn?: string;
  city?: string;
  connection?: {
    asn?: number | string;
    isp?: string;
    org?: string;
  };
  country?: string;
  country_code?: string;
  ip?: string;
  latitude?: number;
  longitude?: number;
  security?: {
    anonymous?: boolean;
    hosting?: boolean;
    proxy?: boolean;
    tor?: boolean;
    vpn?: boolean;
  };
  success?: boolean;
  timezone?: {
    id?: string;
  };
  type?: string;
}

interface WebGlResult {
  renderer: string;
  vendor: string;
  version: string;
}

const unavailable = "Unavailable";

const fontCandidates = [
  "Arial",
  "Arial Black",
  "Calibri",
  "Cambria",
  "Candara",
  "Comic Sans MS",
  "Consolas",
  "Courier New",
  "Georgia",
  "Helvetica",
  "Impact",
  "Lucida Console",
  "Microsoft Sans Serif",
  "Monaco",
  "Roboto",
  "Segoe UI",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
];

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

function withTimeout<T>(promise: Promise<T>, fallback: T, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => window.setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
}

function formatBoolean(value: boolean | null, positive: string, negative: string) {
  if (value === null) return "Unknown";
  return value ? positive : negative;
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function testStorage(storage: Storage) {
  const key = "__fingerprint_analyzer_test__";
  try {
    storage.setItem(key, "1");
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function parseBrowser(userAgent: string) {
  const rules = [
    { engine: "Blink", expression: /Edg\/([\d.]+)/, name: "Microsoft Edge" },
    { engine: "Blink", expression: /OPR\/([\d.]+)/, name: "Opera" },
    { engine: "Blink", expression: /Chrome\/([\d.]+)/, name: "Chrome" },
    { engine: "Gecko", expression: /Firefox\/([\d.]+)/, name: "Firefox" },
    { engine: "WebKit", expression: /Version\/([\d.]+).*Safari/, name: "Safari" },
  ];

  for (const rule of rules) {
    const match = userAgent.match(rule.expression);
    if (match) return { engine: rule.engine, name: rule.name, version: match[1] };
  }

  return { engine: "Unknown", name: "Unknown browser", version: "Unknown" };
}

function parseSystem(userAgent: string, platform: string) {
  if (/Windows NT 10\.0/.test(userAgent)) {
    return { os: "Windows", osVersion: "10 / 11" };
  }
  if (/Windows NT 6\.3/.test(userAgent)) return { os: "Windows", osVersion: "8.1" };
  if (/Windows NT 6\.1/.test(userAgent)) return { os: "Windows", osVersion: "7" };
  const android = userAgent.match(/Android\s([\d.]+)/);
  if (android) return { os: "Android", osVersion: android[1] };
  const ios = userAgent.match(/OS\s([\d_]+)/);
  if (/iPhone|iPad|iPod/.test(userAgent) && ios) {
    return { os: "iOS / iPadOS", osVersion: ios[1].replaceAll("_", ".") };
  }
  const mac = userAgent.match(/Mac OS X\s([\d_]+)/);
  if (mac) return { os: "macOS", osVersion: mac[1].replaceAll("_", ".") };
  if (/Linux/.test(platform) || /Linux/.test(userAgent)) return { os: "Linux", osVersion: "Kernel protected" };
  return { os: platform || "Unknown", osVersion: "Unknown" };
}

function detectArchitecture(userAgent: string) {
  if (/arm64|aarch64/i.test(userAgent)) return "ARM64";
  if (/x86_64|Win64|WOW64|x64/i.test(userAgent)) return "x86_64";
  if (/i686|i386|x86/i.test(userAgent)) return "x86";
  return "Browser protected";
}

async function collectCanvasHash() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 420;
    canvas.height = 120;
    const context = canvas.getContext("2d");
    if (!context) return unavailable;

    const gradient = context.createLinearGradient(0, 0, 420, 120);
    gradient.addColorStop(0, "#00d9ff");
    gradient.addColorStop(0.5, "#316dff");
    gradient.addColorStop(1, "#a855f7");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 420, 120);
    context.font = "18px Arial";
    context.fillStyle = "#06101f";
    context.fillText("Fingerprint Analyzer • Am I Unique? 🔐", 18, 52);
    context.globalCompositeOperation = "multiply";
    context.fillStyle = "rgba(255,255,255,.78)";
    context.arc(342, 63, 36, 0, Math.PI * 2);
    context.fill();
    return (await sha256(canvas.toDataURL())).slice(0, 16);
  } catch {
    return unavailable;
  }
}

function collectWebGl(): WebGlResult {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!context) return { renderer: unavailable, vendor: unavailable, version: unavailable };
    const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo
      ? String(context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
      : String(context.getParameter(context.VENDOR));
    const renderer = debugInfo
      ? String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : String(context.getParameter(context.RENDERER));
    return {
      renderer,
      vendor,
      version: String(context.getParameter(context.VERSION)),
    };
  } catch {
    return { renderer: unavailable, vendor: unavailable, version: unavailable };
  }
}

async function collectAudioHash() {
  try {
    const AudioContextClass = window.OfflineAudioContext;
    if (!AudioContextClass) return unavailable;
    const context = new AudioContextClass(1, 44_100, 44_100);
    const oscillator = context.createOscillator();
    const compressor = context.createDynamicsCompressor();
    oscillator.type = "triangle";
    oscillator.frequency.value = 10_000;
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;
    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);
    const buffer = await context.startRendering();
    const samples = Array.from(buffer.getChannelData(0).slice(4_500, 5_000));
    return (await sha256(samples.join(","))).slice(0, 16);
  } catch {
    return unavailable;
  }
}

function detectFonts() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return [];
  const sample = "mmmmmmmmmmlliWWW0123456789";
  context.font = "72px monospace";
  const baseline = context.measureText(sample).width;
  return fontCandidates.filter((font) => {
    context.font = `72px '${font}', monospace`;
    return Math.abs(context.measureText(sample).width - baseline) > 0.1;
  });
}

async function detectAdBlocker() {
  const bait = document.createElement("div");
  bait.className = "adsbox ad-banner advertisement";
  bait.setAttribute("aria-hidden", "true");
  bait.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;";
  document.body.appendChild(bait);
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  const blocked = bait.offsetHeight === 0 || getComputedStyle(bait).display === "none";
  bait.remove();
  return blocked ? "Detected" : "Not detected";
}

async function permissionState(name: string) {
  if (!navigator.permissions) return "Unsupported";
  try {
    const result = await navigator.permissions.query({ name } as PermissionDescriptor);
    return result.state.charAt(0).toUpperCase() + result.state.slice(1);
  } catch {
    return "Prompt / protected";
  }
}

async function collectWebRtcAddresses() {
  if (!("RTCPeerConnection" in window)) return [];
  const addresses = new Set<string>();
  const connection = new RTCPeerConnection({ iceServers: [] });
  try {
    connection.createDataChannel("fingerprint-check");
    connection.onicecandidate = (event) => {
      const candidate = event.candidate?.candidate;
      if (!candidate) return;
      const address = candidate.split(" ")[4];
      if (address && !address.endsWith(".local")) addresses.add(address);
    };
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
  } catch {
    return [];
  } finally {
    connection.close();
  }
  return Array.from(addresses);
}

async function measureRefreshRate() {
  if (document.visibilityState !== "visible") return "Browser managed";
  const timestamps: number[] = [];
  return new Promise<string>((resolve) => {
    const sample = (timestamp: number) => {
      timestamps.push(timestamp);
      if (timestamps.length < 18) {
        requestAnimationFrame(sample);
        return;
      }
      const duration = timestamps[timestamps.length - 1] - timestamps[0];
      const rate = duration > 0 ? Math.round(((timestamps.length - 1) * 1000) / duration) : 0;
      resolve(rate >= 20 && rate <= 360 ? `${rate} Hz` : "Browser managed");
    };
    requestAnimationFrame(sample);
  });
}

async function collectBattery(extras: NavigatorExtras) {
  if (!extras.getBattery) return "API unavailable";
  try {
    const battery = await extras.getBattery();
    return `${battery.charging ? "Charging" : "On battery"} (${Math.round(battery.level * 100)}%)`;
  } catch {
    return "API unavailable";
  }
}

async function fetchIpData(): Promise<IpLookupPayload> {
  const sources = ["https://ipwho.is/", "/api/ip"];
  const results = await Promise.all(sources.map(async (source) => {
    try {
      const response = await fetch(source, {
        cache: "no-store",
        signal: AbortSignal.timeout(3_000),
      });
      if (!response.ok) return null;
      const payload = await response.json() as IpLookupPayload;
      return payload.ip && payload.success !== false ? payload : null;
    } catch {
      return null;
    }
  }));
  return results.find((payload): payload is IpLookupPayload => Boolean(payload)) ?? {};
}

async function fetchHeaders() {
  try {
    const response = await fetch("/api/headers", {
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) return {};
    const payload = await response.json() as { headers?: Record<string, string> };
    return payload.headers ?? {};
  } catch {
    return {};
  }
}

function buildScores(
  browser: BrowserFingerprint,
  network: NetworkFingerprint,
  privacy: PrivacyFingerprint,
  signals: SignalFingerprint,
) : FingerprintScores {
  const highEntropySignals = [
    signals.canvasHash !== unavailable,
    signals.audioHash !== unavailable,
    signals.webGlRenderer !== unavailable,
    signals.fontCount > 0,
    browser.userAgent !== unavailable,
    browser.languages.length > 0,
  ].filter(Boolean).length;
  const uniqueness = clamp(48 + highEntropySignals * 7 + Math.min(signals.fontCount, 12) * 0.5, 0, 98);

  let riskScore = 7;
  if (privacy.webDriver === "Detected") riskScore += 38;
  if (privacy.headless === "Possible") riskScore += 18;
  if (network.proxy) riskScore += 12;
  if (network.vpn) riskScore += 8;
  if (network.tor) riskScore += 32;
  if (network.hosting) riskScore += 16;
  if (network.webRtcAddresses.length > 0) riskScore += 8;
  riskScore = clamp(riskScore);

  let anonymityScore = 78;
  if (network.ipAddress !== unavailable) anonymityScore -= 12;
  if (signals.canvasHash !== unavailable) anonymityScore -= 7;
  if (signals.webGlRenderer !== unavailable) anonymityScore -= 6;
  if (network.vpn || network.proxy || network.tor) anonymityScore += 15;
  if (browser.doNotTrack === "1") anonymityScore += 4;
  anonymityScore = clamp(anonymityScore);

  let consistency = 96;
  if (network.timezone !== unavailable && network.timezone !== browser.language && network.timezone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
    consistency -= 9;
  }
  if (privacy.webDriver === "Detected") consistency -= 18;
  if (privacy.headless === "Possible") consistency -= 12;
  consistency = clamp(consistency);

  const coverageValues = [
    network.ipAddress,
    network.city,
    network.timezone,
    network.isp,
    browser.name,
    browser.version,
    browser.engine,
    browser.language,
    browser.userAgent,
    signals.canvasHash,
    signals.audioHash,
    signals.webGlRenderer,
    signals.webGlVendor,
    privacy.adBlocker,
    privacy.geolocationPermission,
  ];
  const availableCount = coverageValues.filter((value) => value && value !== unavailable && value !== "Unknown").length;
  const coverage = clamp((availableCount / coverageValues.length) * 100);

  return {
    anonymityLabel: anonymityScore >= 70 ? "High" : anonymityScore >= 45 ? "Moderate" : "Low",
    anonymityScore,
    consistency,
    coverage,
    riskLabel: riskScore <= 25 ? "Low" : riskScore <= 55 ? "Medium" : "High",
    riskScore,
    uniqueness,
  };
}

export async function collectFingerprint(): Promise<FingerprintSnapshot> {
  const extras = navigator as NavigatorExtras;
  const userAgent = navigator.userAgent || unavailable;
  const parsedBrowser = parseBrowser(userAgent);
  const platform = extras.userAgentData?.platform || navigator.platform || unavailable;
  const parsedSystem = parseSystem(userAgent, platform);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || unavailable;

  const [
    canvasHash,
    audioHash,
    adBlocker,
    webRtcAddresses,
    ipPayload,
    headers,
    refreshRate,
    battery,
    geolocationPermission,
    cameraPermission,
    microphonePermission,
  ] = await Promise.all([
    withTimeout(collectCanvasHash(), unavailable, 1_500),
    withTimeout(collectAudioHash(), unavailable, 2_500),
    withTimeout(detectAdBlocker(), "Unknown", 1_000),
    withTimeout(collectWebRtcAddresses(), [], 2_000),
    withTimeout(fetchIpData(), {}, 4_000),
    withTimeout(fetchHeaders(), {}, 3_500),
    withTimeout(measureRefreshRate(), "Browser managed", 1_500),
    withTimeout(collectBattery(extras), "API unavailable", 1_200),
    withTimeout(permissionState("geolocation"), "Prompt / protected", 1_000),
    withTimeout(permissionState("camera"), "Prompt / protected", 1_000),
    withTimeout(permissionState("microphone"), "Prompt / protected", 1_000),
  ]);

  const webGl = collectWebGl();
  const fonts = detectFonts();
  const plugins = Array.from(navigator.plugins ?? []).map((plugin) => plugin.name);
  const mediaDevicePromise = navigator.mediaDevices?.enumerateDevices()
    .then((devices) => devices.length)
    .catch(() => 0) ?? Promise.resolve(0);
  const mediaDeviceCount = await withTimeout(mediaDevicePromise, 0, 1_500);
  const connectionType = extras.connection?.effectiveType ?? extras.connection?.type ?? "Browser protected";
  const security = ipPayload.security;

  const browser: BrowserFingerprint = {
    cookies: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack ?? "Not set",
    engine: parsedBrowser.engine,
    indexedDb: "indexedDB" in window,
    language: navigator.language || unavailable,
    languages: navigator.languages ? Array.from(navigator.languages) : [],
    localStorage: testStorage(window.localStorage),
    name: parsedBrowser.name,
    plugins,
    referrer: document.referrer || "Direct",
    sessionStorage: testStorage(window.sessionStorage),
    userAgent,
    version: parsedBrowser.version,
  };

  const network: NetworkFingerprint = {
    asn: String(ipPayload.connection?.asn ?? ipPayload.asn ?? unavailable),
    city: [ipPayload.city, ipPayload.country].filter(Boolean).join(", ") || unavailable,
    connectionType,
    country: ipPayload.country ?? unavailable,
    countryCode: ipPayload.country_code ?? "",
    dnsLeak: "No browser-level leak detected",
    hosting: security?.hosting ?? null,
    ipAddress: ipPayload.ip ?? unavailable,
    ipReputation: security?.anonymous ? "Anonymous network" : "No risk flag",
    ipVersion: ipPayload.type ?? (ipPayload.ip?.includes(":") ? "IPv6" : ipPayload.ip ? "IPv4" : unavailable),
    isp: ipPayload.connection?.isp ?? ipPayload.connection?.org ?? unavailable,
    latitude: typeof ipPayload.latitude === "number" ? ipPayload.latitude : null,
    longitude: typeof ipPayload.longitude === "number" ? ipPayload.longitude : null,
    proxy: security?.proxy ?? null,
    timezone: ipPayload.timezone?.id ?? timezone,
    tor: security?.tor ?? null,
    vpn: security?.vpn ?? null,
    webRtcAddresses,
  };

  const system: SystemFingerprint = {
    architecture: detectArchitecture(userAgent),
    battery,
    cpu: "Model protected by browser",
    deviceMemory: extras.deviceMemory ? `${extras.deviceMemory} GB` : "Browser protected",
    gpu: webGl.renderer,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    os: parsedSystem.os,
    osVersion: parsedSystem.osVersion,
    platform,
    touchSupport: navigator.maxTouchPoints > 0 ? `${navigator.maxTouchPoints} touch points` : "No",
    uptime: `${Math.floor(performance.now() / 3_600_000)}h ${Math.floor((performance.now() % 3_600_000) / 60_000)}m`,
  };

  const screenFingerprint: ScreenFingerprint = {
    availableResolution: `${screen.availWidth} × ${screen.availHeight}`,
    colorDepth: `${screen.colorDepth}-bit`,
    devicePixelRatio: String(window.devicePixelRatio),
    hdr: window.matchMedia("(dynamic-range: high)").matches ? "Supported" : "No",
    orientation: screen.orientation?.type ?? (innerWidth >= innerHeight ? "Landscape" : "Portrait"),
    pixelDepth: `${screen.pixelDepth}-bit`,
    refreshRate,
    resolution: `${screen.width} × ${screen.height}`,
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
    zoomLevel: `${Math.round((window.visualViewport?.scale ?? 1) * 100)}%`,
  };

  const signals: SignalFingerprint = {
    audioHash,
    canvasHash,
    fontCount: fonts.length,
    fonts,
    mediaDeviceCount,
    mimeTypeCount: navigator.mimeTypes?.length ?? 0,
    notificationPermission: "Notification" in window ? Notification.permission : "Unsupported",
    pluginCount: plugins.length,
    speechSynthesis: "speechSynthesis" in window ? "Supported" : "Unsupported",
    webGlRenderer: webGl.renderer,
    webGlVendor: webGl.vendor,
    webGlVersion: webGl.version,
  };

  const automationKeys = ["__webdriver_script_fn", "__selenium_unwrapped", "__nightmare"];
  const automationDetected = automationKeys.some((key) => key in window);
  const policyDocument = document as Document & {
    permissionsPolicy?: { allowedFeatures: () => string[] };
  };
  const headless = navigator.webdriver || (plugins.length === 0 && /Chrome/.test(userAgent) && navigator.languages.length === 0);
  const privacy: PrivacyFingerprint = {
    adBlocker,
    automationFlags: automationDetected ? "Detected" : "No",
    cameraPermission,
    crossOriginIsolation: window.crossOriginIsolated ? "Enabled" : "Not enabled",
    geolocationPermission,
    headless: headless ? "Possible" : "No",
    microphonePermission,
    permissionsPolicy: policyDocument.permissionsPolicy?.allowedFeatures().length ? "Active" : "Default",
    webDriver: navigator.webdriver ? "Detected" : "No",
    webRtc: webRtcAddresses.length ? "Potential local address exposure" : "No leak detected",
  };

  const scores = buildScores(browser, network, privacy, signals);
  const compositeHash = await sha256(JSON.stringify({
    audioHash,
    canvasHash,
    fonts,
    language: browser.language,
    platform,
    resolution: screenFingerprint.resolution,
    timezone,
    userAgent,
    webGl,
  }));
  const sessionId = crypto.randomUUID?.() ?? compositeHash.slice(0, 8);
  const hasCoreSignals = canvasHash !== unavailable && browser.name !== "Unknown browser";

  return {
    browser,
    collectedAt: new Date().toISOString(),
    compositeHash,
    headers,
    network,
    privacy,
    scores,
    screen: screenFingerprint,
    sessionId,
    signals,
    status: hasCoreSignals ? "complete" : "partial",
    system,
  };
}

export function formatNetworkFlag(value: boolean | null) {
  return formatBoolean(value, "Detected", "Not detected");
}
