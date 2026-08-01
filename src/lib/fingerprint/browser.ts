import type { BrowserProfile } from "@/types/fingerprint";

interface ExtendedNavigator extends Navigator {
  connection?: {
    downlink?: number;
    effectiveType?: string;
    rtt?: number;
    saveData?: boolean;
  };
  deviceMemory?: number;
  userAgentData?: {
    architecture?: string;
    mobile?: boolean;
    platform?: string;
  };
}

export interface ExtendedWindow extends Window {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

export const emptyBrowser: BrowserProfile = {
  architecture: "Detecting…",
  browser: "Detecting…",
  browserVersion: "",
  canvasHash: "Detecting…",
  colorDepth: 0,
  connection: "Detecting…",
  cookies: false,
  device: "Detecting…",
  deviceMemory: "Detecting…",
  doNotTrack: "Detecting…",
  engine: "Detecting…",
  fonts: [],
  gpuRenderer: "Detecting…",
  gpuVendor: "Detecting…",
  hardwareConcurrency: 0,
  language: "Detecting…",
  languages: [],
  os: "Detecting…",
  osVersion: "Detecting…",
  pixelRatio: 0,
  platform: "Detecting…",
  screen: "Detecting…",
  storage: false,
  timezone: "Detecting…",
  touchPoints: 0,
  userAgent: "Detecting browser environment…",
  webdriver: false,
  webgl: false,
};

function detectBrowser(userAgent: string) {
  const rules = [
    { engine: "Blink", name: "Microsoft Edge", pattern: /Edg\/([\d.]+)/ },
    { engine: "Blink", name: "Opera", pattern: /OPR\/([\d.]+)/ },
    { engine: "Blink", name: "Google Chrome", pattern: /Chrome\/([\d.]+)/ },
    { engine: "Gecko", name: "Mozilla Firefox", pattern: /Firefox\/([\d.]+)/ },
    { engine: "WebKit", name: "Safari", pattern: /Version\/([\d.]+).*Safari/ },
  ];

  for (const rule of rules) {
    const match = userAgent.match(rule.pattern);
    if (match) return { engine: rule.engine, name: rule.name, version: match[1] };
  }
  return { engine: "Unknown", name: "Unknown browser", version: "" };
}

function detectOs(userAgent: string, platform: string) {
  if (/Windows NT 10\.0/.test(userAgent)) return { name: "Windows", version: "10 / 11" };
  if (/Windows NT 6\.3/.test(userAgent)) return { name: "Windows", version: "8.1" };
  const mac = userAgent.match(/Mac OS X ([\d_]+)/);
  if (mac) return { name: "macOS", version: mac[1].replaceAll("_", ".") };
  const ios = userAgent.match(/(?:iPhone OS|CPU OS) ([\d_]+)/);
  if (ios) return { name: "iOS", version: ios[1].replaceAll("_", ".") };
  const android = userAgent.match(/Android ([\d.]+)/);
  if (android) return { name: "Android", version: android[1] };
  if (/Linux/i.test(platform) || /Linux/i.test(userAgent)) return { name: "Linux", version: "Generic" };
  return { name: platform || "Unknown", version: "Unknown" };
}

function getWebGlInfo() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl");
    if (!(context instanceof WebGLRenderingContext)) {
      return { renderer: "Unavailable", vendor: "Unavailable", webgl: false };
    }
    const extension = context.getExtension("WEBGL_debug_renderer_info");
    const vendor = extension
      ? String(context.getParameter(extension.UNMASKED_VENDOR_WEBGL))
      : String(context.getParameter(context.VENDOR));
    const renderer = extension
      ? String(context.getParameter(extension.UNMASKED_RENDERER_WEBGL))
      : String(context.getParameter(context.RENDERER));
    return { renderer, vendor, webgl: true };
  } catch {
    return { renderer: "Blocked", vendor: "Blocked", webgl: false };
  }
}

function getCanvasSignature() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 80;
    const context = canvas.getContext("2d");
    if (!context) return "unavailable";
    const gradient = context.createLinearGradient(0, 0, 320, 0);
    gradient.addColorStop(0, "#7c4dff");
    gradient.addColorStop(1, "#5be3a4");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 320, 80);
    context.font = "18px Arial";
    context.fillStyle = "#130a26";
    context.fillText("FingerprintChecked ⚡ 2026", 14, 48);
    return canvas.toDataURL();
  } catch {
    return "blocked";
  }
}

function getAvailableFonts() {
  if (!document.fonts) return [];
  const candidates = [
    "Arial", "Arial Black", "Calibri", "Cambria", "Courier New", "Georgia",
    "Helvetica", "Segoe UI", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana",
  ];
  return candidates.filter((font) => document.fonts.check(`12px "${font}"`));
}

function hasStorage() {
  try {
    const key = "__fpc_probe__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export async function sha256(value: string) {
  try {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
  }
}

export async function collectBrowserProfile(): Promise<BrowserProfile> {
  const extendedNavigator = navigator as ExtendedNavigator;
  const browser = detectBrowser(navigator.userAgent);
  const platform = extendedNavigator.userAgentData?.platform || navigator.platform || "Unknown";
  const os = detectOs(navigator.userAgent, platform);
  const gpu = getWebGlInfo();
  const canvasHash = await sha256(getCanvasSignature());
  const connection = extendedNavigator.connection;
  const connectionText = connection?.effectiveType
    ? `${connection.effectiveType.toUpperCase()} · ${connection.downlink ?? "—"} Mbps · ${connection.rtt ?? "—"} ms`
    : navigator.onLine ? "Online" : "Offline";

  return {
    architecture: extendedNavigator.userAgentData?.architecture || (/arm|aarch64/i.test(navigator.userAgent) ? "ARM" : "x86 / x64"),
    browser: browser.name,
    browserVersion: browser.version,
    canvasHash,
    colorDepth: screen.colorDepth,
    connection: connectionText,
    cookies: navigator.cookieEnabled,
    device: extendedNavigator.userAgentData?.mobile || /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
    deviceMemory: extendedNavigator.deviceMemory ? `${extendedNavigator.deviceMemory} GB` : "Not exposed",
    doNotTrack: navigator.doNotTrack ?? "Unspecified",
    engine: browser.engine,
    fonts: getAvailableFonts(),
    gpuRenderer: gpu.renderer,
    gpuVendor: gpu.vendor,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    language: navigator.language,
    languages: [...navigator.languages],
    os: os.name,
    osVersion: os.version,
    pixelRatio: window.devicePixelRatio,
    platform,
    screen: `${screen.width} × ${screen.height}`,
    storage: hasStorage(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
    touchPoints: navigator.maxTouchPoints || 0,
    userAgent: navigator.userAgent,
    webdriver: navigator.webdriver,
    webgl: gpu.webgl,
  };
}
