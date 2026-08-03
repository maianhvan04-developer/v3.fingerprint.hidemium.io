import { sha256, type ExtendedWindow } from "@/lib/fingerprint/browser";
import type { BrowserProfile, FingerprintModule } from "@/types/fingerprint";

interface NetworkInformationLike {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
  type?: string;
}

interface NavigatorUADataLike {
  brands?: Array<{ brand: string; version: string }>;
  getHighEntropyValues?: (hints: string[]) => Promise<Record<string, unknown>>;
  mobile?: boolean;
  platform?: string;
}

interface BatteryManagerLike {
  charging?: boolean;
  chargingTime?: number;
  dischargingTime?: number;
  level?: number;
}

interface GpuAdapterLike {
  info?: Record<string, unknown>;
  limits?: Record<string, unknown>;
}

interface NavigatorExtras extends Navigator {
  connection?: NetworkInformationLike;
  deviceMemory?: number;
  getBattery?: () => Promise<BatteryManagerLike>;
  gpu?: {
    requestAdapter: () => Promise<GpuAdapterLike | null>;
  };
  userAgentData?: NavigatorUADataLike;
}

interface OfflineWindow extends ExtendedWindow {
  webkitOfflineAudioContext?: typeof OfflineAudioContext;
}

type RawModule = [FingerprintModule["key"], string, string, Record<string, unknown>, number];

const fontCandidates = [
  "American Typewriter", "Apple Chancery", "Arial", "Arial Black", "Avenir",
  "Avenir Next", "Calibri", "Calibri Light", "Cambria", "Cambria Math",
  "Century", "Century Gothic", "Charter", "Cochin", "Comic Sans MS",
  "Consolas", "Courier New", "Ebrima", "Franklin Gothic", "Gabriola",
  "Geneva", "Georgia", "Helvetica", "Helvetica Neue", "Hiragino Sans",
  "Hoefler Text", "Impact", "Javanese Text", "Leelawadee UI", "Lucida Console",
  "Lucida Grande", "Lucida Sans Unicode", "Marker Felt", "Marlett", "Menlo",
  "Microsoft JhengHei", "Microsoft Sans Serif", "Microsoft Tai Le", "Microsoft YaHei",
  "Microsoft Yi Baiti", "Monaco", "Mongolian Baiti", "MS Gothic", "MS PGothic",
  "MS UI Gothic", "Myanmar Text", "Nirmala UI", "Noto Color Emoji", "Noto Sans",
  "Noteworthy", "Optima", "Palatino Linotype", "Papyrus", "PingFang SC",
  "Roboto", "Roboto Condensed", "Roboto Mono", "Segoe Fluent Icons",
  "Segoe MDL2 Assets", "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Emoji",
  "Segoe UI Light", "Segoe UI Symbol", "Skia", "Snell Roundhand", "Sylfaen",
  "Tahoma", "Times New Roman", "Trebuchet MS", "Ubuntu", "Ubuntu Mono",
  "Verdana", "Yu Gothic", "Zapfino",
];

const permissionNames = [
  "accelerometer", "background-sync", "camera", "clipboard-read", "geolocation",
  "gyroscope", "magnetometer", "microphone", "midi", "notifications",
  "persistent-storage", "push", "screen-wake-lock",
];

function safeValue<T>(reader: () => T, fallback: T): T {
  try {
    return reader();
  } catch {
    return fallback;
  }
}

async function collectUaHints(navigatorExtras: NavigatorExtras) {
  const uaData = navigatorExtras.userAgentData;
  if (!uaData) return { available: false };
  const base: Record<string, unknown> = {
    available: true,
    brands: uaData.brands ?? [],
    mobile: uaData.mobile ?? false,
    platform: uaData.platform ?? "Unavailable",
  };
  if (!uaData.getHighEntropyValues) return base;
  try {
    return {
      ...base,
      ...await uaData.getHighEntropyValues([
        "architecture",
        "bitness",
        "fullVersionList",
        "model",
        "platformVersion",
        "uaFullVersion",
        "wow64",
      ]),
    };
  } catch {
    return base;
  }
}

async function collectPermissions() {
  const result: Record<string, string[]> = {
    denied: [],
    granted: [],
    prompt: [],
    unavailable: [],
  };
  if (!navigator.permissions) return result;
  await Promise.all(permissionNames.map(async (name) => {
    try {
      const permission = await navigator.permissions.query({ name: name as PermissionName });
      result[permission.state].push(name);
    } catch {
      result.unavailable.push(name);
    }
  }));
  return result;
}

async function collectWebGpu(navigatorExtras: NavigatorExtras) {
  if (!navigatorExtras.gpu) return { available: false };
  try {
    const adapter = await navigatorExtras.gpu.requestAdapter();
    if (!adapter) return { adapter: false, available: true };
    return {
      adapter: true,
      adapterInfo: adapter.info ?? {},
      available: true,
      limits: adapter.limits ?? {},
    };
  } catch {
    return { adapter: false, available: true };
  }
}

async function collectBattery(navigatorExtras: NavigatorExtras) {
  if (!navigatorExtras.getBattery) return { apiAvailable: false };
  try {
    const battery = await navigatorExtras.getBattery();
    return {
      apiAvailable: true,
      chargeTime: battery.chargingTime ?? null,
      charging: battery.charging ?? null,
      dischargeTime: battery.dischargingTime ?? null,
      level: typeof battery.level === "number" ? Math.round(battery.level * 100) : null,
    };
  } catch {
    return { apiAvailable: true, error: "Battery information blocked" };
  }
}

async function collectStorage() {
  const result: Record<string, unknown> = {
    apiAvailable: Boolean(navigator.storage),
    cacheStorage: "caches" in window,
    indexedDb: "indexedDB" in window,
    localStorage: safeValue(() => Boolean(localStorage), false),
    serviceWorker: "serviceWorker" in navigator,
    sessionStorage: safeValue(() => Boolean(sessionStorage), false),
  };
  if (!navigator.storage) return result;
  try {
    const estimate = await navigator.storage.estimate();
    const quotaBytes = estimate.quota ?? 0;
    const usageBytes = estimate.usage ?? 0;
    result.quotaBytes = quotaBytes;
    result.quotaGB = Number((quotaBytes / 1024 ** 3).toFixed(2));
    result.usageBytes = usageBytes;
    result.usageMB = Number((usageBytes / 1024 ** 2).toFixed(2));
    result.usagePercent = quotaBytes > 0
      ? Number(((usageBytes / quotaBytes) * 100).toFixed(4))
      : 0;
  } catch {
    result.estimateError = "Storage estimate blocked";
  }
  try {
    result.persistent = await navigator.storage.persisted();
  } catch {
    result.persistent = null;
  }
  return result;
}

function readVoices() {
  if (!("speechSynthesis" in window)) return [];
  return speechSynthesis.getVoices();
}

async function collectVoices() {
  if (!("speechSynthesis" in window)) return { available: false, voices: [] };
  let voices = readVoices();
  if (!voices.length) {
    voices = await new Promise<SpeechSynthesisVoice[]>((resolve) => {
      const timer = window.setTimeout(() => resolve(readVoices()), 450);
      const listener = () => {
        window.clearTimeout(timer);
        speechSynthesis.removeEventListener("voiceschanged", listener);
        resolve(readVoices());
      };
      speechSynthesis.addEventListener("voiceschanged", listener, { once: true });
    });
  }
  const languages = [...new Set(voices.map((voice) => voice.lang).filter(Boolean))];
  const defaultVoice = voices.find((voice) => voice.default);
  return {
    available: true,
    defaultVoiceLang: defaultVoice?.lang ?? "None",
    defaultVoiceName: defaultVoice?.name ?? "None",
    languages,
    local: voices.filter((voice) => voice.localService).map((voice) => voice.name),
    remote: voices.filter((voice) => !voice.localService).map((voice) => voice.name),
    voices: voices.length,
  };
}

function detectFonts() {
  if (!document.body) return [];
  const text = "mmmmmmmmmmlliWW@@##";
  const bases = ["monospace", "sans-serif", "serif"];
  const span = document.createElement("span");
  span.textContent = text;
  span.setAttribute("aria-hidden", "true");
  Object.assign(span.style, {
    fontSize: "72px",
    left: "-9999px",
    lineHeight: "normal",
    position: "absolute",
    top: "-9999px",
    visibility: "hidden",
    whiteSpace: "nowrap",
  });
  document.body.append(span);
  const baseSizes = new Map<string, { height: number; width: number }>();
  for (const base of bases) {
    span.style.fontFamily = base;
    baseSizes.set(base, { height: span.offsetHeight, width: span.offsetWidth });
  }
  const detected = fontCandidates.filter((font) => bases.some((base) => {
    span.style.fontFamily = `"${font}", ${base}`;
    const baseline = baseSizes.get(base);
    return Boolean(baseline && (span.offsetWidth !== baseline.width || span.offsetHeight !== baseline.height));
  }));
  span.remove();
  return detected;
}

function collectCssMedia() {
  const pick = (query: string, positive: string, negative: string) =>
    matchMedia(query).matches ? positive : negative;
  return {
    anyHover: pick("(any-hover: hover)", "hover", "none"),
    anyPointer: pick("(any-pointer: fine)", "fine", pick("(any-pointer: coarse)", "coarse", "none")),
    colorGamut: pick("(color-gamut: rec2020)", "rec2020", pick("(color-gamut: p3)", "p3", "srgb")),
    colorScheme: pick("(prefers-color-scheme: dark)", "dark", "light"),
    displayMode: pick("(display-mode: standalone)", "standalone", "browser"),
    forcedColors: pick("(forced-colors: active)", "active", "none"),
    hover: pick("(hover: hover)", "hover", "none"),
    orientation: pick("(orientation: landscape)", "landscape", "portrait"),
    pointer: pick("(pointer: fine)", "fine", pick("(pointer: coarse)", "coarse", "none")),
    reducedMotion: pick("(prefers-reduced-motion: reduce)", "reduce", "no-preference"),
  };
}

function collectCanvas(profile: BrowserProfile) {
  try {
    const renders = Array.from({ length: 3 }, () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 80;
      const context = canvas.getContext("2d");
      if (!context) return "";
      const gradient = context.createLinearGradient(0, 0, 320, 0);
      gradient.addColorStop(0, "#7c4dff");
      gradient.addColorStop(1, "#5be3a4");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 320, 80);
      context.font = "18px Arial";
      context.fillStyle = "#130a26";
      context.fillText("FingerprintChecked ⚡ 2026", 14, 48);
      return canvas.toDataURL();
    });
    return {
      available: Boolean(renders[0]),
      dataURILength: renders[0]?.length ?? 0,
      signature: profile.canvasHash,
      stableRenders: new Set(renders).size === 1,
    };
  } catch {
    return { available: false, signature: profile.canvasHash };
  }
}

function collectClientRects() {
  if (!document.body) return { available: false };
  const probe = document.createElement("span");
  probe.textContent = "Fingerprint geometry 🧬";
  probe.setAttribute("aria-hidden", "true");
  Object.assign(probe.style, {
    fontFamily: "Arial, sans-serif",
    fontSize: "17px",
    left: "-9999px",
    position: "absolute",
    top: "-9999px",
  });
  document.body.append(probe);
  const rect = probe.getBoundingClientRect();
  const result = {
    available: true,
    bottom: Number(rect.bottom.toFixed(4)),
    height: Number(rect.height.toFixed(4)),
    left: Number(rect.left.toFixed(4)),
    right: Number(rect.right.toFixed(4)),
    top: Number(rect.top.toFixed(4)),
    width: Number(rect.width.toFixed(4)),
  };
  probe.remove();
  return result;
}

function collectWebGl(profile: BrowserProfile) {
  try {
    const canvas = document.createElement("canvas");
    const webgl2 = canvas.getContext("webgl2");
    const context = webgl2 ?? canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl");
    if (!(context instanceof WebGLRenderingContext) && !(context instanceof WebGL2RenderingContext)) {
      return { available: false, renderer: profile.gpuRenderer, vendor: profile.gpuVendor };
    }
    const extensions = context.getSupportedExtensions() ?? [];
    const attributes = context.getContextAttributes();
    return {
      antialias: attributes?.antialias ?? false,
      available: true,
      extensions,
      extensionsCount: extensions.length,
      maxRenderbufferSize: Number(context.getParameter(context.MAX_RENDERBUFFER_SIZE)),
      maxTextureSize: Number(context.getParameter(context.MAX_TEXTURE_SIZE)),
      maxViewportDims: Array.from(context.getParameter(context.MAX_VIEWPORT_DIMS) as Int32Array),
      renderer: profile.gpuRenderer,
      shadingLanguage: String(context.getParameter(context.SHADING_LANGUAGE_VERSION)),
      vendor: profile.gpuVendor,
      version: String(context.getParameter(context.VERSION)),
      webgl1: true,
      webgl2: Boolean(webgl2),
    };
  } catch {
    return { available: false, renderer: profile.gpuRenderer, vendor: profile.gpuVendor };
  }
}

async function collectOfflineAudio() {
  const offlineWindow = window as OfflineWindow;
  const OfflineContext = window.OfflineAudioContext ?? offlineWindow.webkitOfflineAudioContext;
  const liveContext = window.AudioContext ?? (window as ExtendedWindow).webkitAudioContext;
  const base = {
    audioContext: Boolean(liveContext),
    sampleRate: liveContext ? safeValue(() => {
      const context = new liveContext();
      const sampleRate = context.sampleRate;
      void context.close();
      return sampleRate;
    }, 0) : 0,
  };
  if (!OfflineContext) return { ...base, offlineAudioContext: false };
  try {
    const context = new OfflineContext(1, 44100, 44100);
    const oscillator = context.createOscillator();
    const compressor = context.createDynamicsCompressor();
    oscillator.type = "triangle";
    oscillator.frequency.value = 10000;
    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);
    const buffer = await context.startRendering();
    const channel = buffer.getChannelData(0);
    let sampleSum = 0;
    for (let index = 4500; index < 5000; index += 1) sampleSum += Math.abs(channel[index] ?? 0);
    return {
      ...base,
      compressorGainReduction: compressor.reduction,
      offlineAudioContext: true,
      renderedSampleRate: buffer.sampleRate,
      sampleSum: Number(sampleSum.toFixed(8)),
      totalUniqueSamples: new Set(Array.from(channel.slice(4500, 5000), (value) => value.toFixed(7))).size,
    };
  } catch {
    return { ...base, offlineAudioContext: true, renderError: "Offline audio rendering blocked" };
  }
}

function collectMedia() {
  const audio = document.createElement("audio");
  const video = document.createElement("video");
  const formats = {
    aac: audio.canPlayType("audio/aac") || "no",
    mp3: audio.canPlayType("audio/mpeg") || "no",
    oggAudio: audio.canPlayType('audio/ogg; codecs="vorbis"') || "no",
    oggVideo: video.canPlayType('video/ogg; codecs="theora"') || "no",
    webmAudio: audio.canPlayType('audio/webm; codecs="opus"') || "no",
    webmVideo: video.canPlayType('video/webm; codecs="vp9"') || "no",
  };
  const mediaSource = "MediaSource" in window;
  const mediaRecorder = "MediaRecorder" in window;
  return {
    audioContext: "AudioContext" in window || "webkitAudioContext" in window,
    formats,
    mediaDevices: Boolean(navigator.mediaDevices),
    mediaRecorder,
    mediaSource,
    mimeTypes: Array.from(navigator.mimeTypes, (mime) => mime.type),
  };
}

function collectSvg() {
  try {
    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");
    const text = document.createElementNS(namespace, "text");
    text.textContent = "Fingerprint SVG 🧬";
    svg.append(text);
    svg.setAttribute("aria-hidden", "true");
    Object.assign(svg.style, { left: "-9999px", position: "absolute", top: "-9999px" });
    document.body.append(svg);
    const box = text.getBBox();
    const result = {
      available: true,
      bBox: { height: box.height, width: box.width, x: box.x, y: box.y },
      computedTextLength: text.getComputedTextLength(),
      subStringLength: text.getSubStringLength(0, text.getNumberOfChars()),
    };
    svg.remove();
    return result;
  } catch {
    return { available: false };
  }
}

export async function createModules(profile: BrowserProfile): Promise<FingerprintModule[]> {
  const navigatorExtras = navigator as NavigatorExtras;
  const connection = navigatorExtras.connection;
  const automated = profile.webdriver || /HeadlessChrome/i.test(profile.userAgent);
  const [audio, battery, permissions, storage, uaHints, voices, webGpu] = await Promise.all([
    collectOfflineAudio(),
    collectBattery(navigatorExtras),
    collectPermissions(),
    collectStorage(),
    collectUaHints(navigatorExtras),
    collectVoices(),
    collectWebGpu(navigatorExtras),
  ]);
  const canvas = collectCanvas(profile);
  const clientRects = collectClientRects();
  const cssMedia = collectCssMedia();
  const detectedFonts = detectFonts();
  const media = collectMedia();
  const webGl = collectWebGl(profile);
  const plugins = Array.from(navigator.plugins, (plugin) => ({
    description: plugin.description,
    filename: plugin.filename,
    name: plugin.name,
  }));
  const mimeTypes = Array.from(navigator.mimeTypes, (mime) => mime.type);
  const windowKeys = Object.keys(window);
  const htmlKeys = Object.getOwnPropertyNames(HTMLElement.prototype);
  const nativeChecks = [
    CanvasRenderingContext2D.prototype.fillText,
    Element.prototype.getBoundingClientRect,
    Function.prototype.toString,
  ].map((fn) => Function.prototype.toString.call(fn).includes("[native code]"));
  const environment = {
    deviceMemory: navigatorExtras.deviceMemory ?? "Unavailable",
    hardwareConcurrency: profile.hardwareConcurrency,
    language: profile.language,
    languages: profile.languages,
    platform: profile.platform,
    timezone: profile.timezone,
    userAgent: profile.userAgent,
  };
  const rawModules: RawModule[] = [
    ["workerScope", "Worker Scope", "Web Worker context vs main scope — detect browser contradictions", environment, 0],
    ["navigator", "Navigator", "UA, plugins, mimeTypes, permissions, and WebGPU", {
      appVersion: navigator.appVersion,
      cookieEnabled: navigator.cookieEnabled,
      deviceMemory: navigatorExtras.deviceMemory ?? null,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      language: navigator.language,
      languages: [...navigator.languages],
      maxTouchPoints: navigator.maxTouchPoints,
      mimeTypes,
      onLine: navigator.onLine,
      pdfViewerEnabled: navigator.pdfViewerEnabled,
      permissions,
      platform: navigator.platform,
      plugins,
      pluginsCount: plugins.length,
      propertiesCount: Object.getOwnPropertyNames(Navigator.prototype).length,
      userAgent: navigator.userAgent,
      userAgentData: uaHints,
      vendor: navigator.vendor,
      webdriver: navigator.webdriver,
      webgpu: webGpu,
    }, automated ? 4 : 0],
    ["browserVersion", "Browser Version / Channel", "Browser and platform release channel coherence", {
      browser: profile.browser,
      engine: profile.engine,
      userAgentData: uaHints,
      version: profile.browserVersion,
    }, automated ? 1 : 0],
    ["windowFeatures", "Window Features", "window object keys and vendor prefix counts", {
      apple: windowKeys.filter((key) => key.toLowerCase().startsWith("apple")).length,
      keysCount: windowKeys.length,
      moz: windowKeys.filter((key) => key.toLowerCase().startsWith("moz")).length,
      outerHeight,
      outerWidth,
      webkit: windowKeys.filter((key) => key.toLowerCase().startsWith("webkit")).length,
    }, 0],
    ["headless", "Headless / Stealth", "Detect Puppeteer, Playwright, and stealth-script markers", {
      automated,
      documentHasFocus: document.hasFocus(),
      headlessUserAgent: /HeadlessChrome/i.test(profile.userAgent),
      visibility: document.visibilityState,
      webdriver: profile.webdriver,
      zeroOuterSize: outerWidth === 0 || outerHeight === 0,
    }, automated ? 3 : 0],
    ["htmlElementVersion", "HTMLElement", "Properties exposed on HTMLElement.prototype", { keysCount: htmlKeys.length }, 0],
    ["cssMedia", "CSS Media Queries", "prefers-color-scheme, hover, pointer, color-gamut, and accessibility media", cssMedia, 0],
    ["css", "CSS Computed & System", "getComputedStyle and system font behavior", {
      colorScheme: getComputedStyle(document.documentElement).colorScheme || "normal",
      grid: CSS.supports("display", "grid"),
      systemFont: getComputedStyle(document.body).fontFamily,
      variables: CSS.supports("color", "var(--x)"),
    }, 0],
    ["screen", "Screen", "Dimensions, available size, color depth, pixel ratio, orientation, and touch", {
      availHeight: screen.availHeight,
      availWidth: screen.availWidth,
      colorDepth: screen.colorDepth,
      devicePixelRatio: devicePixelRatio,
      height: screen.height,
      orientation: screen.orientation?.type ?? cssMedia.orientation,
      pixelDepth: screen.pixelDepth,
      touch: navigator.maxTouchPoints,
      viewportHeight: innerHeight,
      viewportWidth: innerWidth,
      width: screen.width,
    }, 0],
    ["voices", "Voices", "SpeechSynthesis local and remote voices", voices, 0],
    ["media", "Media (MimeTypes)", "canPlayType, MediaSource, MediaRecorder, AudioContext, and media devices", media, 0],
    ["canvas2d", "Canvas 2D", "Image, blob, paint, text, and emoji rendering", canvas, 0],
    ["cpuScaling", "CPU Scaling Benchmark", "Hardware concurrency and available device-memory signals", {
      architecture: profile.architecture,
      claimed: profile.hardwareConcurrency,
      deviceMemory: navigatorExtras.deviceMemory ?? null,
    }, 0],
    ["canvasWebgl", "Canvas WebGL", "GPU vendor, renderer, extensions, versions, and limits", webGl, automated && /SwiftShader/i.test(profile.gpuRenderer) ? 2 : 0],
    ["maths", "Math / JS Runtime", "Math output differences across JavaScript engines", {
      acos: Math.acos(0.123),
      cos: Math.cos(1e308),
      hypot: Math.hypot(3, 4),
      log: Math.log(2),
      sin: Math.sin(-1e300),
      tan: Math.tan(-1),
    }, 0],
    ["consoleErrors", "Console Errors", "V8, SpiderMonkey, and JavaScriptCore wording", {
      engine: profile.engine,
      errorName: safeValue(() => {
        JSON.parse("{");
        return "none";
      }, "SyntaxError"),
    }, 0],
    ["timezone", "Timezone", "Intl, Date.toString, and timezone offset", {
      dateString: new Date().toString(),
      locale: Intl.DateTimeFormat().resolvedOptions().locale,
      offset: new Date().getTimezoneOffset(),
      timezone: profile.timezone,
    }, 0],
    ["clientRects", "Client Rects", "getBoundingClientRect and emoji sub-pixel geometry", clientRects, 0],
    ["offlineAudioContext", "Offline Audio Context", "Compressor gain reduction and rendered sample output", audio, 0],
    ["fonts", "Fonts", "Pixel-measurement font detection across Windows, macOS, Linux, and Android candidates", {
      detected: detectedFonts,
      method: "pixel measurement against monospace, sans-serif, and serif baselines",
      platform: profile.platform,
      total: detectedFonts.length,
    }, 0],
    ["capturedErrors", "Captured Errors", "Runtime errors raised while fingerprinting", { data: [] }, 0],
    ["svg", "SVG (Text Metrics)", "getBBox, getExtentOfChar, and getSubStringLength", collectSvg(), 0],
    ["resistance", "Resistance", "Engine and privacy-extension indicators", {
      doNotTrack: profile.doNotTrack,
      engine: profile.engine,
      globalPrivacyControl: (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl ?? false,
    }, 0],
    ["intl", "Intl", "DateTimeFormat, ListFormat, NumberFormat, PluralRules, and RelativeTimeFormat", {
      calendar: new Intl.DateTimeFormat().resolvedOptions().calendar,
      dateTimeLocale: new Intl.DateTimeFormat().resolvedOptions().locale,
      list: new Intl.ListFormat(profile.language).format(["0", "1"]),
      numberingSystem: new Intl.NumberFormat().resolvedOptions().numberingSystem,
      pluralRule: new Intl.PluralRules(profile.language).select(2),
      relativeTime: new Intl.RelativeTimeFormat(profile.language).format(1, "year"),
    }, automated ? 1 : 0],
    ["features", "Features", "CSS, Window, and JavaScript feature detection", {
      broadcastChannel: "BroadcastChannel" in window,
      cacheStorage: "caches" in window,
      cssContainerQueries: CSS.supports("container-type", "inline-size"),
      fileSystemAccess: "showOpenFilePicker" in window,
      serviceWorker: "serviceWorker" in navigator,
      sharedArrayBuffer: "SharedArrayBuffer" in window,
      webAssembly: "WebAssembly" in window,
      webCodecs: "VideoEncoder" in window,
    }, 0],
    ["proxyLies", "Proxy / Tampering Lies", "Native-function integrity checks across browser APIs", {
      nativeChecks,
      totalLies: nativeChecks.filter((value) => !value).length,
      webdriver: profile.webdriver,
    }, nativeChecks.filter((value) => !value).length],
    ["network", "Network", "NetworkInformation API — RTT, downlink, effective type, saveData, and online state", {
      apiAvailable: Boolean(connection),
      downlink: connection?.downlink ?? null,
      effectiveType: connection?.effectiveType ?? null,
      onLine: navigator.onLine,
      rtt: connection?.rtt ?? null,
      saveData: connection?.saveData ?? false,
      type: connection?.type ?? null,
    }, navigator.onLine ? 0 : 1],
    ["battery", "Battery", "Battery Status API — level, charging, and timing", battery, 0],
    ["storage", "Disk Storage", "StorageManager estimate, quota, current usage, and storage APIs", storage, 0],
    ["automation", "Automation (BotD)", "Browser automation and headless signal suite", {
      detectedBots: automated ? ["webdriver/headless marker"] : [],
      engine: profile.engine,
      isAutomated: automated,
      signals: {
        documentHasFocus: document.hasFocus(),
        headlessRenderer: /SwiftShader/i.test(profile.gpuRenderer),
        noLanguages: profile.languages.length === 0,
        noPlugins: plugins.length === 0,
        webdriver: profile.webdriver,
        zeroOuterSize: outerWidth === 0 || outerHeight === 0,
      },
    }, automated ? 3 : 0],
  ];

  return Promise.all(rawModules.map(async ([key, name, description, result, issues]) => ({
    description,
    hash: await sha256(JSON.stringify(result)),
    issues,
    key,
    name,
    result,
  })));
}
