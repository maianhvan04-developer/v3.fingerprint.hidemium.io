import { sha256, type ExtendedWindow } from "@/lib/fingerprint/browser";
import type { BrowserProfile, FingerprintModule } from "@/types/fingerprint";

interface NetworkNavigator extends Navigator {
  connection?: {
    downlink?: number;
    effectiveType?: string;
    rtt?: number;
    saveData?: boolean;
  };
}

type RawModule = [string, string, Record<string, unknown>, number];

export async function createModules(profile: BrowserProfile): Promise<FingerprintModule[]> {
  const extendedNavigator = navigator as NetworkNavigator;
  const extendedWindow = window as ExtendedWindow;
  const automated = profile.webdriver || /HeadlessChrome/i.test(profile.userAgent);
  const environment = {
    browser: `${profile.browser} ${profile.browserVersion}`,
    platform: profile.platform,
    timezone: profile.timezone,
  };
  const rawModules: RawModule[] = [
    ["Worker Scope", "Web Worker context vs main scope — detect browser contradictions", environment, 0],
    ["Navigator", "UA, plugins, mimeTypes, permissions, WebGPU", { userAgent: profile.userAgent, languages: profile.languages, cookies: profile.cookies }, automated ? 4 : 0],
    ["Browser Version / Channel", "Browser and platform release channel coherence", { browser: profile.browser, version: profile.browserVersion, engine: profile.engine }, automated ? 1 : 0],
    ["Window Features", "window object keys and vendor prefix counts", { keys: Object.keys(window).length, outerSize: `${outerWidth} × ${outerHeight}` }, 0],
    ["Headless / Stealth", "Detect Puppeteer, Playwright, and stealth-script markers", { automated, webdriver: profile.webdriver, visibility: document.visibilityState }, automated ? 3 : 0],
    ["HTMLElement", "Properties exposed on HTMLElement.prototype", { keys: Object.getOwnPropertyNames(HTMLElement.prototype).length }, 0],
    ["CSS Media Queries", "prefers-color-scheme, hover, pointer, and color-gamut", { dark: matchMedia("(prefers-color-scheme: dark)").matches, hover: matchMedia("(hover: hover)").matches }, 0],
    ["CSS Computed & System", "getComputedStyle and system font behavior", { grid: CSS.supports("display", "grid"), variables: CSS.supports("color", "var(--x)") }, 0],
    ["Screen", "Dimensions, color depth, and touch surface", { resolution: profile.screen, colorDepth: profile.colorDepth, touchPoints: profile.touchPoints }, 0],
    ["Voices", "SpeechSynthesis local and remote voices", { available: "speechSynthesis" in window, voices: "speechSynthesis" in window ? speechSynthesis.getVoices().length : 0 }, 0],
    ["Media (MimeTypes)", "canPlayType, MediaSource, and MediaRecorder", { mediaSource: "MediaSource" in window, mediaRecorder: "MediaRecorder" in window }, 0],
    ["Canvas 2D", "Image, blob, paint, text, and emoji rendering", { hash: profile.canvasHash }, 0],
    ["CPU Scaling Benchmark", "Worker parallelism compared with hardwareConcurrency", { concurrency: profile.hardwareConcurrency, architecture: profile.architecture }, 0],
    ["Canvas WebGL", "GPU vendor, renderer, extensions, and parameters", { available: profile.webgl, renderer: profile.gpuRenderer, vendor: profile.gpuVendor }, automated && /SwiftShader/i.test(profile.gpuRenderer) ? 2 : 0],
    ["Math / JS Runtime", "Math output differences across JavaScript engines", { acos: Math.acos(0.123), hypot: Math.hypot(3, 4), tan: Math.tan(-1) }, 0],
    ["Console Errors", "V8, SpiderMonkey, and JavaScriptCore wording", { engine: profile.engine, available: true }, 0],
    ["Timezone", "Intl, Date.toString, and timezone offset", { timezone: profile.timezone, offset: new Date().getTimezoneOffset() }, 0],
    ["Client Rects", "getBoundingClientRect and emoji sub-pixel geometry", { viewport: { height: innerHeight, width: innerWidth }, pixelRatio: profile.pixelRatio }, 0],
    ["Offline Audio Context", "Compressor gain reduction and sample output", { supported: Boolean(extendedWindow.AudioContext || extendedWindow.webkitAudioContext) }, 0],
    ["Fonts", "document.fonts.check and pixel measurements", { detected: profile.fonts, total: profile.fonts.length }, 0],
    ["Captured Errors", "Runtime errors raised while fingerprinting", { data: [] }, 0],
    ["SVG (Text Metrics)", "getBBox, getExtentOfChar, and getSubStringLength", { supported: "SVGGraphicsElement" in window }, 0],
    ["Resistance", "Engine and extension patterns such as Tor or Brave", { engine: profile.engine, doNotTrack: profile.doNotTrack }, 0],
    ["Intl", "DateTimeFormat, ListFormat, NumberFormat, and PluralRules", { locale: profile.language, calendar: new Intl.DateTimeFormat().resolvedOptions().calendar }, automated ? 1 : 0],
    ["Features", "CSS, Window, and JavaScript version detection", { broadcastChannel: "BroadcastChannel" in window, serviceWorker: "serviceWorker" in navigator, webAssembly: "WebAssembly" in window }, 0],
    ["Proxy / Tampering Lies", "CreepJS-style checks across patched browser APIs", { webdriver: profile.webdriver, renderer: profile.gpuRenderer }, automated ? 1 : 0],
    ["Network", "NetworkInformation API — RTT, downlink, type, and saveData", { connection: extendedNavigator.connection ?? null, online: navigator.onLine }, 0],
    ["Battery", "Battery Status API — level, charging, and timing", { supported: "getBattery" in navigator }, 0],
    ["Disk Storage", "StorageManager estimate, quota, and current origin usage", { indexedDb: "indexedDB" in window, localStorage: profile.storage }, 0],
    ["Automation (BotD)", "BotD signal suite — webdriver and headless markers", { automated, webdriver: profile.webdriver }, 0],
  ];

  return Promise.all(rawModules.map(async ([name, description, result, issues]) => ({
    description,
    hash: await sha256(JSON.stringify(result)),
    issues,
    name,
    result,
  })));
}
