import "client-only";

import {
  collectOfficialFingerprint,
  type OfficialFingerprintResult,
} from "@/lib/fingerprint/provider";
import type {
  BrowserLeakSections,
  BrowserFingerprint,
  FingerprintScores,
  FingerprintSnapshot,
  FingerprintJsonValue,
  FingerprintSmartSignals,
  NetworkFingerprint,
  PrivacyFingerprint,
  ScreenFingerprint,
  SignalFingerprint,
  SystemFingerprint,
} from "@/types/fingerprint";

type NavigatorExtras = Navigator & {
  appCodeName?: string;
  appName?: string;
  appVersion?: string;
  connection?: {
    downlink?: number;
    effectiveType?: string;
    rtt?: number;
    saveData?: boolean;
    type?: string;
  };
  deviceMemory?: number;
  getBattery?: () => Promise<{
    charging: boolean;
    level: number;
  }>;
  globalPrivacyControl?: boolean;
  pdfViewerEnabled?: boolean;
  product?: string;
  productSub?: string;
  userAgentData?: {
    brands?: Array<{ brand: string; version: string }>;
    getHighEntropyValues?: (hints: string[]) => Promise<Record<string, FingerprintJsonValue>>;
    mobile?: boolean;
    platform?: string;
  };
  vendor?: string;
  vendorSub?: string;
};

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

interface CanvasResult {
  dataUrl: string;
  dataUrlLength: number;
  hash: string;
  imageDataHash: string;
  supported: boolean;
  textMetrics: Record<string, number>;
  winding: string;
}

interface WebGlResult {
  contextName: string;
  contextAttributes: Record<string, FingerprintJsonValue>;
  extensions: string[];
  parameters: Record<string, string>;
  renderer: string;
  shadingLanguageVersion: string;
  vendor: string;
  version: string;
}

interface BrowserLeaksTlsPayload {
  akamai_hash?: string;
  akamai_text?: string;
  ja3_hash?: string;
  ja3_text?: string;
  ja3n_hash?: string;
  ja3n_text?: string;
  ja4?: string;
  ja4_o?: string;
  ja4_r?: string;
  ja4_ro?: string;
  user_agent?: string;
}

const unavailable = "Unavailable";

const unavailableCanvasFingerprint: CanvasResult = {
  dataUrl: unavailable,
  dataUrlLength: 0,
  hash: unavailable,
  imageDataHash: unavailable,
  supported: false,
  textMetrics: {},
  winding: unavailable,
};

type BrowserLeaksReferenceKey = keyof BrowserLeakSections;

interface BrowserLeaksReferenceSection {
  categories?: Record<string, string[]>;
  fetchedAt?: string;
  fields: string[];
  sections?: Record<string, string[]>;
  source: string;
}

type BrowserLeaksReference = Record<BrowserLeaksReferenceKey, BrowserLeaksReferenceSection>;

interface BrowserLeaksReferenceResponse {
  data?: Partial<Record<BrowserLeaksReferenceKey, BrowserLeaksReferenceSection>>;
}

const fallbackBrowserLeaksReference: BrowserLeaksReference = {
  canvas: {
    fields: [
      "Canvas 2D API",
      "Text API for Canvas",
      "Canvas toDataURL",
      "Signature",
      "Uniqueness",
      "Image File Details",
      "File Size",
      "Number of Colors",
      "PNG Headers",
      "Chunk",
      "Length",
      "CRC",
      "Content",
      "Signature Stats",
    ],
    source: "https://browserleaks.com/canvas",
  },
  contentFilters: {
    fields: [
      "HTTP Proxy Headers",
      "Tor IP Address",
      "Tor Letterboxing",
      "Canvas Protection",
      "Subscriptions",
      "AdGuard",
      "Dark Reader",
    ],
    source: "https://browserleaks.com/proxy",
  },
  features: {
    fields: [],
    categories: {
      css: [
        "CSS all property",
        "CSS Animations",
        "CSS Appearance",
        "CSS Backdrop Filter",
        "CSS Background Blend Mode",
        "CSS Background Clip Text",
        "CSS background-position Shorthand",
        "CSS background-position-x/y",
        "CSS background-repeat: round",
        "CSS background-repeat: space",
        "CSS background-size",
        "CSS background-size: cover",
        "CSS border-image",
        "CSS border-radius",
        "CSS box-decoration-break",
        "CSS box-shadow",
        "CSS box-sizing",
        "CSS calc",
        "CSS :checked pseudo-selector",
        "CSS Font ch Units",
        "CSS Columns",
        "CSS Grid (new)",
        "CSS Grid (legacy)",
        "CSS aspect-ratio",
        "CSS Variables (Custom Properties)",
        "CSS.escape()",
        "CSS Filters",
        "CSS @font-face",
        "Flexbox",
        "Flex Gap",
        "CSS :focus-within pseudo-selector",
        "CSS font-display",
        "CSS Gradients",
        "CSS HSLA Colors",
        "CSS RGBA Colors",
        "CSS Mask",
        "CSS Media Queries",
        "CSS Hover Media Query",
        "CSS Pointer Media Query",
        "CSS Object Fit",
        "CSS Pointer Events",
        "CSS position: sticky",
        "CSS @supports",
        "CSS text-decoration",
        "CSS Transforms",
        "CSS Transforms 3D",
        "CSS Transitions",
        "CSS user-select",
        "CSS font-variation-settings",
        "CSS HiDPI/Retina Hairlines",
      ],
      ecmaScript: [
        "ES5",
        "ES5 Syntax",
        "ES5 Strict Mode",
        "ES5 Array",
        "ES5 Date",
        "ES5 Function",
        "ES5 Object",
        "ES5 String",
        "ES6 Array",
        "ES6 Arrow Functions",
        "ES6 Collections",
        "ES6 Generators",
        "ES6 Math",
        "ES6 Numbers",
        "ES6 Object",
        "ES6 Promises",
        "ES6 Rest parameters",
        "ES6 Spread array",
        "ES6 Template Strings",
        "Typed Arrays",
        "ES7 Array",
        "ES8 Object",
      ],
      graphics: [
        "Canvas",
        "Canvas Text",
        "Emoji",
        "Canvas.toDataURL image/jpeg",
        "Canvas.toDataURL image/png",
        "Canvas.toDataURL image/webp",
        "Canvas Blending Support",
        "Canvas Winding Support",
        "SVG",
        "Inline SVG",
        "SVG as an IMG tag source",
        "SVG CSS clip-path",
        "SVG SMIL animation",
        "SVG foreignObject",
        "SVG Filters",
        "Image crossOrigin",
        "Lazy loading via attribute for images & iframes",
        "IMG srcset attribute",
      ],
      html5: [
        "History API",
        "HTML5 Audio Element",
        "Audio Loop Attribute",
        "HTML5 Audio ogg vorbis",
        "HTML5 Audio mp3",
        "HTML5 Audio wav",
        "HTML5 Audio m4a/aac",
        "HTML5 Audio opus",
        "Web Audio API",
        "Speech Recognition API",
        "Speech Synthesis API",
        "HTML5 Video",
        "HTML5 Video ogg",
        "HTML5 Video webm",
        "HTML5 Video h264",
        "HTML5 Video vp9",
        "HTML5 Video hls",
        "HTML5 Video crossOrigin",
        "Input Attribute autocomplete",
        "Input Attribute autofocus",
        "Input Attribute list",
        "Input Attribute max",
        "Input Attribute min",
        "Input Attribute multiple",
        "Input Attribute pattern",
        "Input Attribute placeholder",
        "Input Attribute required",
        "Input Attribute step",
        "Form Validation",
        "postMessage",
        "Web Workers",
        "Shared Web Workers",
        "DOM Element.classList",
        "dataset API",
        "Document Fragment",
        "Intersection Observer API",
        "DOM4 MutationObserver",
        "Shadow DOM API",
        "QuerySelector",
        "matchMedia",
        "PushManager",
        "ResizeObserver",
        "Web Animations API",
        "Vibration API",
      ],
      miscellaneous: [
        "Geolocation API",
        "a[download] Attribute",
        "a[ping] Attribute",
        "Battery API",
        "Blob Constructor",
        "Content Editable",
        "Cross-Origin Resource Sharing",
        "Custom Protocol Handler",
        "DataView",
        "CustomEvent",
        "addEventListener",
        "Device Motion Event",
        "Device Orientation Event",
        "DOM Pointer Events API",
        "File API",
        "Fullscreen API",
        "GamePad API",
        "Native JSON Parsing",
        "MathML",
        "Notifications API",
        "Navigation Timing API",
        "Pointer Lock API",
        "requestAnimationFrame",
        "script async",
        "script defer",
        "Blob URLs",
        "URL parser",
        "URLSearchParams",
        "Internationalization API",
        "Page Visibility API",
        "Custom Elements API",
        "Media Source Extensions API",
        "Channel Messaging API",
        "Proxy Object",
        "Web Authentication PublicKeyCredential",
        "TextEncoder",
        "TextDecoder",
        "Link rel=prefetch",
      ],
      network: [
        "WebSockets",
        "WebSockets Binary",
        "WebRTC Data Channel",
        "WebRTC getUserMedia",
        "WebRTC MediaStream Recording API",
        "WebRTC Peer Connections",
        "XHR responseType arraybuffer",
        "XHR responseType blob",
        "XHR responseType document",
        "XHR responseType json",
        "XHR responseType text",
        "XHR2 XMLHTTPRequest Level 2",
        "Connection Effective Type",
        "Low Bandwidth Connection",
        "Server Sent Events",
        "Fetch API",
        "Beacon API",
        "ServiceWorker API",
        "XDomainRequest API",
      ],
      storage: [
        "Cookie",
        "Web Storage API localStorage",
        "Quota Storage Management API",
        "Web Storage API sessionStorage",
        "IE User Data API",
        "Web SQL Database",
        "Application Cache",
      ],
    },
    source: "https://browserleaks.com/features",
  },
  fonts: {
    fields: [
      "Font Metrics Fingerprint",
      "Font Metrics Report",
      "Unicode Glyphs Fingerprint",
      "Unicode Glyph Measurements",
    ],
    source: "https://browserleaks.com/fonts",
  },
  geolocation: {
    fields: [
      "Origin Permissions",
      "Global Permissions",
      "API Status",
      "watchPosition",
      "getCurrentPosition",
      "Cache Age",
      "Latitude",
      "Longitude",
      "Accuracy",
      "Altitude",
      "Altitude Accuracy",
      "Heading",
      "Speed",
      "Reverse Geocoding",
    ],
    source: "https://browserleaks.com/geo",
  },
  ipAddress: {
    fields: [
      "IP Address",
      "Hostname",
      "Country",
      "State/Region",
      "City",
      "ISP",
      "Organization",
      "Network",
      "Usage Type",
      "Timezone",
      "Local Time",
      "Coordinates",
      "IPv6 Address",
      "Local IP Address",
      "Public IP Address",
      "DNS Leak Test",
      "TCP/IP OS",
      "MTU",
      "Distance",
      "JA4T",
      "TLS JA4",
      "TLS JA3 Hash",
      "HTTP/2 Akamai Hash",
      "HTTP Headers",
      "Tor Relay Details",
      "IP Address Whois",
    ],
    source: "https://browserleaks.com/ip",
  },
  javaScript: {
    fields: [
      "JavaScript Enabled",
      "Inline Scripts",
      "Same-Origin Scripts",
      "Third-Party Scripts",
      "Document Referrer",
      "Screen Resolution",
      "Fullscreen Leak Test",
      "width",
      "height",
      "availWidth",
      "availHeight",
      "colorDepth",
      "pixelDepth",
      "orientation.type",
      "orientation.angle",
      "window.devicePixelRatio",
      "window.innerWidth",
      "window.innerHeight",
      "window.outerWidth",
      "window.outerHeight",
      "Date/Time",
      "Internationalization API",
      "Navigator Object",
      "navigator.userAgentData",
      "navigator.plugins",
      "Mime Types",
      "Battery Status API",
      "Network Information API",
      "Web Bluetooth API",
      "Web Audio API",
      "SpeechSynthesis",
      "Rest of window.navigator",
      "Internet Explorer Features",
      "ActiveX",
      "Client Capabilities",
    ],
    source: "https://browserleaks.com/javascript",
  },
  tls: {
    fields: [
      "HTTP User-Agent",
      "TLS 1.3",
      "TLS 1.2",
      "TLS 1.1",
      "TLS 1.0",
      "Active Content",
      "Passive Content",
      "JA4",
      "JA4_r",
      "JA4_o",
      "JA4_ro",
      "JA3",
      "JA3_r",
      "JA3_n",
      "JA3_rn",
      "TLS Protocol",
      "Cipher Suite",
      "Key Exchange",
      "Signature Scheme",
      "ECH Success",
      "Outer SNI",
      "Inner SNI",
      "Supported Cipher Suites",
      "Supported TLS Extensions",
    ],
    source: "https://browserleaks.com/tls",
  },
  webGl: {
    fields: [
      "HTTP User-Agent",
      "WebGL Support",
      "WebGL 2 Support",
      "WebGL Report Hash",
      "WebGL Image Hash",
      "Supported Context Name(s)",
      "GL Version",
      "Shading Language Version",
      "Vendor",
      "Renderer",
      "Unmasked Vendor",
      "Unmasked Renderer",
      "Context Attributes",
      "Vertex Shader",
      "Transform Feedback",
      "Rasterizer",
      "Fragment Shader",
      "Framebuffer",
      "Textures",
      "Uniform Buffers",
      "Supported WebGL Extensions",
    ],
    source: "https://browserleaks.com/webgl",
  },
  webRtc: {
    fields: [
      "IPv4 Address",
      "IPv6 Address",
      "RTCPeerConnection",
      "RTCDataChannel",
      "WebRTC Leak Test",
      "Local IP Address",
      "Public IP Address",
      "SDP Log",
      "Media Devices API Support",
      "Audio Capture Permissions",
      "Video Capture Permissions",
      "Media Devices",
    ],
    source: "https://browserleaks.com/webrtc",
  },
};

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

async function collectCanvasFingerprint(): Promise<CanvasResult> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 420;
    canvas.height = 120;
    const context = canvas.getContext("2d");
    if (!context) {
      return unavailableCanvasFingerprint;
    }

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
    const metrics = context.measureText("BrowserLeaks fingerprint sample 0123456789");
    const imageData = context.getImageData(0, 0, 64, 32).data;
    const dataUrl = canvas.toDataURL("image/png");
    const hash = await sha256(dataUrl);
    const imageDataHash = await sha256(Array.from(imageData).join(","));
    const winding = typeof context.isPointInPath === "function"
      ? `${context.isPointInPath(5, 5, "evenodd" as CanvasFillRule)}`
      : unavailable;

    return {
      dataUrl,
      dataUrlLength: dataUrl.length,
      hash,
      imageDataHash,
      supported: true,
      textMetrics: {
        actualBoundingBoxAscent: Math.round(metrics.actualBoundingBoxAscent || 0),
        actualBoundingBoxDescent: Math.round(metrics.actualBoundingBoxDescent || 0),
        width: Number(metrics.width.toFixed(3)),
      },
      winding,
    };
  } catch {
    return unavailableCanvasFingerprint;
  }
}

function collectWebGl(): WebGlResult {
  try {
    const canvas = document.createElement("canvas");
    const webGl2 = canvas.getContext("webgl2");
    const context = webGl2 ?? canvas.getContext("webgl");
    if (!context) {
      return {
        contextName: unavailable,
        contextAttributes: {},
        extensions: [],
        parameters: {},
        renderer: unavailable,
        shadingLanguageVersion: unavailable,
        vendor: unavailable,
        version: unavailable,
      };
    }
    const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo
      ? String(context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
      : String(context.getParameter(context.VENDOR));
    const renderer = debugInfo
      ? String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : String(context.getParameter(context.RENDERER));
    const contextAttributes = context.getContextAttributes();
    const parameterTokens = [
      ["Alpha Bits", context.ALPHA_BITS],
      ["Blue Bits", context.BLUE_BITS],
      ["Depth Bits", context.DEPTH_BITS],
      ["Green Bits", context.GREEN_BITS],
      ["Max Combined Texture Image Units", context.MAX_COMBINED_TEXTURE_IMAGE_UNITS],
      ["Max Cube Map Texture Size", context.MAX_CUBE_MAP_TEXTURE_SIZE],
      ["Max Fragment Uniform Vectors", context.MAX_FRAGMENT_UNIFORM_VECTORS],
      ["Max Renderbuffer Size", context.MAX_RENDERBUFFER_SIZE],
      ["Max Texture Image Units", context.MAX_TEXTURE_IMAGE_UNITS],
      ["Max Texture Size", context.MAX_TEXTURE_SIZE],
      ["Max Varying Vectors", context.MAX_VARYING_VECTORS],
      ["Max Vertex Attributes", context.MAX_VERTEX_ATTRIBS],
      ["Max Vertex Texture Image Units", context.MAX_VERTEX_TEXTURE_IMAGE_UNITS],
      ["Max Vertex Uniform Vectors", context.MAX_VERTEX_UNIFORM_VECTORS],
      ["Red Bits", context.RED_BITS],
      ["Stencil Bits", context.STENCIL_BITS],
    ] as const;
    const parameters = Object.fromEntries(parameterTokens.map(([name, token]) => {
      try {
        return [name, String(context.getParameter(token))];
      } catch {
        return [name, unavailable];
      }
    }));
    try {
      const viewportDims = context.getParameter(context.MAX_VIEWPORT_DIMS);
      parameters["Max Viewport Dims"] = Array.isArray(viewportDims) || ArrayBuffer.isView(viewportDims)
        ? Array.from(viewportDims as ArrayLike<number>).join(" × ")
        : String(viewportDims);
    } catch {
      parameters["Max Viewport Dims"] = unavailable;
    }

    return {
      contextName: webGl2 ? "webgl2" : "webgl",
      contextAttributes: contextAttributes
        ? {
            "Alpha Buffer": contextAttributes.alpha ?? null,
            "Anti-Aliasing": contextAttributes.antialias ?? null,
            "Depth Buffer": contextAttributes.depth ?? null,
            "Desynchronized": contextAttributes.desynchronized ?? null,
            "Major Performance Caveat": contextAttributes.failIfMajorPerformanceCaveat ?? null,
            "Power Preference": contextAttributes.powerPreference ?? null,
            "Pre-multiplied Alpha": contextAttributes.premultipliedAlpha ?? null,
            "Preserve Drawing Buffer": contextAttributes.preserveDrawingBuffer ?? null,
            "Stencil Buffer": contextAttributes.stencil ?? null,
          }
        : {},
      extensions: context.getSupportedExtensions() ?? [],
      parameters,
      renderer,
      shadingLanguageVersion: String(context.getParameter(context.SHADING_LANGUAGE_VERSION)),
      vendor,
      version: String(context.getParameter(context.VERSION)),
    };
  } catch {
    return {
      contextName: unavailable,
      contextAttributes: {},
      extensions: [],
      parameters: {},
      renderer: unavailable,
      shadingLanguageVersion: unavailable,
      vendor: unavailable,
      version: unavailable,
    };
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
  const sources = ["/api/ip", "https://ipwho.is/"];
  for (const source of sources) {
    try {
      const response = await fetch(source, {
        cache: "no-store",
        signal: AbortSignal.timeout(3_000),
      });
      if (!response.ok) continue;
      const payload = await response.json() as IpLookupPayload;
      if (payload.ip && payload.success !== false) return payload;
    } catch {
      // Try the next live lookup source.
    }
  }
  return {};
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

async function fetchBrowserLeaksTls(): Promise<BrowserLeaksTlsPayload | null> {
  try {
    const response = await fetch("https://tls.browserleaks.com/json", {
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });
    if (!response.ok) return null;
    return await response.json() as BrowserLeaksTlsPayload;
  } catch {
    return null;
  }
}

function mergeBrowserLeaksReference(
  scrapedReference: Partial<Record<BrowserLeaksReferenceKey, BrowserLeaksReferenceSection>> | null,
): BrowserLeaksReference {
  if (!scrapedReference) return fallbackBrowserLeaksReference;

  const mergedEntries = Object.entries(fallbackBrowserLeaksReference).map(([key, fallbackSection]) => {
    const sectionKey = key as BrowserLeaksReferenceKey;
    const scrapedSection = scrapedReference[sectionKey];
    if (!scrapedSection) return [sectionKey, fallbackSection] as const;

    return [
      sectionKey,
      {
        ...fallbackSection,
        ...scrapedSection,
        categories: scrapedSection.categories ?? fallbackSection.categories,
        fields: scrapedSection.fields?.length ? scrapedSection.fields : fallbackSection.fields,
        sections: scrapedSection.sections ?? fallbackSection.sections,
        source: scrapedSection.source || fallbackSection.source,
      },
    ] as const;
  });

  return Object.fromEntries(mergedEntries) as BrowserLeaksReference;
}

async function fetchBrowserLeaksReference(): Promise<BrowserLeaksReference> {
  try {
    const response = await fetch("/api/browserleaks/reference", {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return fallbackBrowserLeaksReference;
    const payload = await response.json() as BrowserLeaksReferenceResponse;
    return mergeBrowserLeaksReference(payload.data ?? null);
  } catch {
    return fallbackBrowserLeaksReference;
  }
}

async function collectClientHints(extras: NavigatorExtras): Promise<Record<string, FingerprintJsonValue>> {
  const userAgentData = extras.userAgentData;
  if (!userAgentData) return {};

  const baseHints: Record<string, FingerprintJsonValue> = {
    brands: userAgentData.brands?.map((brand) => `${brand.brand} ${brand.version}`) ?? [],
    mobile: userAgentData.mobile ?? null,
    platform: userAgentData.platform ?? null,
  };

  if (!userAgentData.getHighEntropyValues) return baseHints;

  try {
    const highEntropyHints = await userAgentData.getHighEntropyValues([
      "architecture",
      "bitness",
      "fullVersionList",
      "model",
      "platformVersion",
      "uaFullVersion",
      "wow64",
    ]);
    return { ...baseHints, ...highEntropyHints };
  } catch {
    return baseHints;
  }
}

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

function collectFeatureMatrix(
  browser: BrowserFingerprint,
  privacy: PrivacyFingerprint,
  signals: SignalFingerprint,
  system: SystemFingerprint,
  webGl: WebGlResult,
) {
  const capabilityWindow = window as Window & {
    ActiveXObject?: unknown;
    CSS?: { escape?: unknown; supports?: (property: string, value?: string) => boolean };
    DeviceMotionEvent?: unknown;
    DeviceOrientationEvent?: unknown;
    XDomainRequest?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  const capabilityNavigator = navigator as Navigator & {
    bluetooth?: unknown;
    brave?: { isBrave?: () => Promise<boolean> };
    connection?: unknown;
    credentials?: unknown;
    gpu?: unknown;
    hid?: unknown;
    serial?: unknown;
    storage?: unknown;
    usb?: unknown;
  };
  const audio = document.createElement("audio");
  const video = document.createElement("video");
  const testInput = document.createElement("input");
  const cssSupports = (property: string, value = "initial") => {
    try {
      return typeof CSS !== "undefined" && CSS.supports(property, value);
    } catch {
      return false;
    }
  };
  const inputSupports = (type: string) => {
    testInput.setAttribute("type", type);
    return testInput.type === type;
  };
  const audioSupports = (type: string) => Boolean(audio.canPlayType?.(type));
  const videoSupports = (type: string) => Boolean(video.canPlayType?.(type));

  return {
    "Ad blocker bait": privacy.adBlocker,
    "Application Cache": yesNo("applicationCache" in window),
    "Audio Loop Attribute": yesNo("loop" in audio),
    "Battery API": system.battery === "API unavailable" ? "Unavailable" : "Available",
    "Beacon API": yesNo("sendBeacon" in navigator),
    "Blob Constructor": yesNo("Blob" in window),
    "Blob URLs": yesNo("URL" in window && "createObjectURL" in URL),
    "Broadcast Channel": yesNo("BroadcastChannel" in window),
    "Cache API": yesNo("caches" in window),
    "Canvas": yesNo("HTMLCanvasElement" in window),
    "Canvas Text": yesNo(Boolean(document.createElement("canvas").getContext("2d")?.fillText)),
    "Canvas Winding Support": yesNo(Boolean(document.createElement("canvas").getContext("2d")?.isPointInPath)),
    "Clipboard API": yesNo("clipboard" in navigator),
    "Cookie enabled": yesNo(browser.cookies),
    "Credential Management": yesNo("credentials" in capabilityNavigator),
    "Cross-origin isolated": privacy.crossOriginIsolation,
    "CSS @font-face": yesNo(cssSupports("font-family", "Arial")),
    "CSS @supports": yesNo(typeof CSS !== "undefined" && typeof CSS.supports === "function"),
    "CSS Animations": yesNo(cssSupports("animation-name", "x")),
    "CSS Appearance": yesNo(cssSupports("appearance", "none")),
    "CSS Backdrop Filter": yesNo(cssSupports("backdrop-filter", "blur(2px)")),
    "CSS Background Blend Mode": yesNo(cssSupports("background-blend-mode", "multiply")),
    "CSS border-radius": yesNo(cssSupports("border-radius", "4px")),
    "CSS box-shadow": yesNo(cssSupports("box-shadow", "0 0 1px #000")),
    "CSS calc": yesNo(cssSupports("width", "calc(100% - 1px)")),
    "CSS.escape()": yesNo(Boolean(capabilityWindow.CSS?.escape)),
    "CSS Filters": yesNo(cssSupports("filter", "blur(1px)")),
    "CSS Grid (new)": yesNo(cssSupports("display", "grid")),
    "CSS Gradients": yesNo(cssSupports("background-image", "linear-gradient(red, blue)")),
    "CSS Media Queries": yesNo("matchMedia" in window),
    "CSS Object Fit": yesNo(cssSupports("object-fit", "cover")),
    "CSS Pointer Events": yesNo(cssSupports("pointer-events", "none")),
    "CSS position: sticky": yesNo(cssSupports("position", "sticky")),
    "CSS Transforms": yesNo(cssSupports("transform", "translateX(1px)")),
    "CSS Transitions": yesNo(cssSupports("transition", "all 1s")),
    "CSS Variables (Custom Properties)": yesNo(cssSupports("--x", "1")),
    "Custom Elements API": yesNo("customElements" in window),
    "CustomEvent": yesNo("CustomEvent" in window),
    "DataView": yesNo("DataView" in window),
    "Device Motion Event": yesNo("DeviceMotionEvent" in capabilityWindow),
    "Device Orientation Event": yesNo("DeviceOrientationEvent" in capabilityWindow),
    "DOM Element.classList": yesNo("classList" in document.documentElement),
    "DOM Pointer Events API": yesNo("PointerEvent" in window),
    "DOM4 MutationObserver": yesNo("MutationObserver" in window),
    "ES6 Arrow Functions": yesNo(true),
    "ES6 Collections": yesNo("Map" in window && "Set" in window),
    "ES6 Promises": yesNo("Promise" in window),
    "ES6 Template Strings": yesNo(true),
    "Fetch API": yesNo("fetch" in window),
    "File API": yesNo("File" in window && "FileReader" in window),
    "Flexbox": yesNo(cssSupports("display", "flex")),
    "Flex Gap": yesNo(cssSupports("gap", "1px")),
    "Form Input Color (type=color)": yesNo(inputSupports("color")),
    "Form Input Date (type=date)": yesNo(inputSupports("date")),
    "Form Input E-mail (type=email)": yesNo(inputSupports("email")),
    "Form Input Local Date and Time (type=datetime-local)": yesNo(inputSupports("datetime-local")),
    "Form Input Month (type=month)": yesNo(inputSupports("month")),
    "Form Input Number (type=number)": yesNo(inputSupports("number")),
    "Form Input Range (type=range)": yesNo(inputSupports("range")),
    "Form Input Search (type=search)": yesNo(inputSupports("search")),
    "Form Input Telephone (type=tel)": yesNo(inputSupports("tel")),
    "Form Input Time (type=time)": yesNo(inputSupports("time")),
    "Form Input URL (type=url)": yesNo(inputSupports("url")),
    "Form Input Week (type=week)": yesNo(inputSupports("week")),
    "Fullscreen API": yesNo("fullscreenEnabled" in document),
    "GamePad API": yesNo("getGamepads" in navigator),
    "Geolocation API": yesNo("geolocation" in navigator),
    "hashchange Event": yesNo("onhashchange" in window),
    "History API": yesNo(Boolean(history.pushState)),
    "HTML5 Audio Element": yesNo("HTMLAudioElement" in window),
    "HTML5 Audio m4a/aac": yesNo(audioSupports("audio/mp4; codecs=\"mp4a.40.2\"")),
    "HTML5 Audio mp3": yesNo(audioSupports("audio/mpeg")),
    "HTML5 Audio ogg vorbis": yesNo(audioSupports("audio/ogg; codecs=\"vorbis\"")),
    "HTML5 Audio opus": yesNo(audioSupports("audio/ogg; codecs=\"opus\"")),
    "HTML5 Audio wav": yesNo(audioSupports("audio/wav; codecs=\"1\"")),
    "HTML5 Video": yesNo("HTMLVideoElement" in window),
    "HTML5 Video h264": yesNo(videoSupports("video/mp4; codecs=\"avc1.42E01E\"")),
    "HTML5 Video ogg": yesNo(videoSupports("video/ogg; codecs=\"theora\"")),
    "HTML5 Video vp9": yesNo(videoSupports("video/webm; codecs=\"vp9\"")),
    "HTML5 Video webm": yesNo(videoSupports("video/webm; codecs=\"vp8, vorbis\"")),
    "iframe[sandbox] Attribute": yesNo("sandbox" in document.createElement("iframe")),
    "iframe[srcdoc] Attribute": yesNo("srcdoc" in document.createElement("iframe")),
    "IMG srcset attribute": yesNo("srcset" in document.createElement("img")),
    "Inline SVG": yesNo("SVGSVGElement" in window),
    "Internationalization API": yesNo("Intl" in window),
    "Intersection Observer API": yesNo("IntersectionObserver" in window),
    "Lazy loading via attribute for images & iframes": yesNo("loading" in document.createElement("img")),
    "IndexedDB": yesNo(browser.indexedDb),
    "Local Storage": yesNo(browser.localStorage),
    "matchMedia": yesNo("matchMedia" in window),
    "Media Devices": yesNo(Boolean(navigator.mediaDevices)),
    "Media Source Extensions API": yesNo("MediaSource" in window),
    "Native JSON Parsing": yesNo("JSON" in window),
    "Navigation Timing API": yesNo("performance" in window && "timing" in performance),
    "Notifications": signals.notificationPermission,
    "Page Visibility API": yesNo("visibilityState" in document),
    "Payment Request": yesNo("PaymentRequest" in window),
    "Permissions API": yesNo("permissions" in navigator),
    "Picture Element": yesNo("HTMLPictureElement" in window),
    "Plugins": signals.pluginCount,
    "Pointer Lock API": yesNo("exitPointerLock" in document),
    "postMessage": yesNo("postMessage" in window),
    "postMessage Structured Clones": yesNo("structuredClone" in window),
    "Proxy Object": yesNo("Proxy" in window),
    "Push API": yesNo("PushManager" in window),
    "QuerySelector": yesNo("querySelector" in document),
    "Quota Storage Management API": yesNo(Boolean(capabilityNavigator.storage)),
    "requestAnimationFrame": yesNo("requestAnimationFrame" in window),
    "ResizeObserver": yesNo("ResizeObserver" in window),
    "Service Worker": yesNo("serviceWorker" in navigator),
    "Server Sent Events": yesNo("EventSource" in window),
    "Session Storage": yesNo(browser.sessionStorage),
    "Shadow DOM API": yesNo("attachShadow" in Element.prototype),
    "Shared Worker": yesNo("SharedWorker" in window),
    "Speech Synthesis": signals.speechSynthesis,
    "Speech Recognition API": yesNo("SpeechRecognition" in window || "webkitSpeechRecognition" in capabilityWindow),
    "SVG": yesNo("SVGSVGElement" in window),
    "TextDecoder": yesNo("TextDecoder" in window),
    "TextEncoder": yesNo("TextEncoder" in window),
    "Touch Support": system.touchSupport,
    "Typed Arrays": yesNo("Uint8Array" in window),
    "URL parser": yesNo("URL" in window),
    "URLSearchParams": yesNo("URLSearchParams" in window),
    "Vibration API": yesNo("vibrate" in navigator),
    "Web Bluetooth": yesNo("bluetooth" in capabilityNavigator),
    "Web Crypto": yesNo("crypto" in window && Boolean(crypto.subtle)),
    "Web GPU": yesNo("gpu" in capabilityNavigator),
    "Web HID": yesNo("hid" in capabilityNavigator),
    "Web Serial": yesNo("serial" in capabilityNavigator),
    "Web USB": yesNo("usb" in capabilityNavigator),
    "Web Animations API": yesNo("animate" in Element.prototype),
    "Web Authentication PublicKeyCredential": yesNo("PublicKeyCredential" in window),
    "Web Storage API localStorage": yesNo(browser.localStorage),
    "Web Storage API sessionStorage": yesNo(browser.sessionStorage),
    "WebAssembly": yesNo("WebAssembly" in window),
    "WebGL": webGl.version,
    "WebGL 2": yesNo(webGl.contextName === "webgl2"),
    "WebGL Extensions": webGl.extensions.length,
    "WebRTC Data Channel": yesNo("RTCDataChannel" in window),
    "WebRTC getUserMedia": yesNo(Boolean(navigator.mediaDevices?.getUserMedia)),
    "WebRTC MediaStream Recording API": yesNo("MediaRecorder" in window),
    "WebRTC Peer Connections": yesNo("RTCPeerConnection" in window),
    "WebRTC": yesNo("RTCPeerConnection" in window),
    "WebSocket": yesNo("WebSocket" in window),
    "WebSockets Binary": yesNo("WebSocket" in window && "Blob" in window),
    "Worker Type Options": yesNo("Worker" in window),
    "Workers": yesNo("Worker" in window),
    "XHR responseType arraybuffer": yesNo("XMLHttpRequest" in window),
    "XHR responseType blob": yesNo("XMLHttpRequest" in window && "Blob" in window),
    "XHR responseType document": yesNo("XMLHttpRequest" in window && "Document" in window),
    "XHR responseType json": yesNo("XMLHttpRequest" in window && "JSON" in window),
    "XHR responseType text": yesNo("XMLHttpRequest" in window),
    "XDomainRequest API": yesNo("XDomainRequest" in capabilityWindow),
  };
}

function buildBrowserLeakSections({
  browser,
  browserLeaksReference,
  browserLeaksTls,
  canvas,
  clientHints,
  compositeHash,
  connectionType,
  fonts,
  headers,
  mediaDeviceCount,
  mimeTypes,
  network,
  plugins,
  privacy,
  refreshRate,
  screenFingerprint,
  signals,
  smartSignals,
  system,
  timezone,
  userAgent,
  webGl,
}: {
  browser: BrowserFingerprint;
  browserLeaksReference: BrowserLeaksReference;
  browserLeaksTls: BrowserLeaksTlsPayload | null;
  canvas: CanvasResult;
  clientHints: Record<string, FingerprintJsonValue>;
  compositeHash: string;
  connectionType: string;
  fonts: string[];
  headers: Record<string, string>;
  mediaDeviceCount: number;
  mimeTypes: string[];
  network: NetworkFingerprint;
  plugins: string[];
  privacy: PrivacyFingerprint;
  refreshRate: string;
  screenFingerprint: ScreenFingerprint;
  signals: SignalFingerprint;
  smartSignals: FingerprintSmartSignals;
  system: SystemFingerprint;
  timezone: string;
  userAgent: string;
  webGl: WebGlResult;
}): BrowserLeakSections {
  const localDate = new Date();
  const featureMatrix = collectFeatureMatrix(browser, privacy, signals, system, webGl);
  const headerEntries = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [`HTTP ${key}`, value]),
  );
  const browserLeaksTlsCipherSuites = browserLeaksTls?.ja3_text?.split(",")[1]?.split("-") ?? [];
  const browserLeaksTlsExtensions = browserLeaksTls?.ja3_text?.split(",")[2]?.split("-") ?? [];

  return {
    canvas: {
      "BrowserLeaks Fields": [...browserLeaksReference.canvas.fields],
      "BrowserLeaks Sections": browserLeaksReference.canvas.sections ?? {},
      "BrowserLeaks Source": browserLeaksReference.canvas.source,
      "AudioContext Hash": signals.audioHash,
      "Canvas Data URL": canvas.dataUrl,
      "Canvas Data URL Length": canvas.dataUrlLength,
      "Canvas SHA-256": canvas.hash,
      "Canvas Short Hash": signals.canvasHash,
      "Canvas Supported": canvas.supported,
      "Composite Hash": compositeHash,
      "ImageData SHA-256": canvas.imageDataHash,
      "Text Metrics": canvas.textMetrics,
      "Winding Rule": canvas.winding,
    },
    contentFilters: {
      "BrowserLeaks Fields": [...browserLeaksReference.contentFilters.fields],
      "BrowserLeaks Sections": browserLeaksReference.contentFilters.sections ?? {},
      "BrowserLeaks Source": browserLeaksReference.contentFilters.source,
      "Ad Blocker": privacy.adBlocker,
      "Automation Flags": privacy.automationFlags,
      "Bot Smart Signal": smartSignals.bot,
      "Developer Tools Smart Signal": smartSignals.developerTools,
      "Do Not Track": browser.doNotTrack,
      "Global Privacy Control": (navigator as NavigatorExtras).globalPrivacyControl ?? null,
      "Headless": privacy.headless,
      "High Activity Device Smart Signal": smartSignals.highActivityDevice,
      "Hosting": network.hosting,
      "Incognito Smart Signal": smartSignals.incognito,
      "IP Blocklist Smart Signal": smartSignals.ipBlocklist,
      "Privacy Settings Smart Signal": smartSignals.privacySettings,
      "Proxy": network.proxy,
      "Rare Device Smart Signal": smartSignals.rareDevice,
      "Tampering Smart Signal": smartSignals.tampering,
      "Tor": network.tor,
      "VPN": network.vpn,
      "Virtual Machine Smart Signal": smartSignals.virtualMachine,
      "WebDriver": privacy.webDriver,
    },
    features: {
      "BrowserLeaks Fields": [...browserLeaksReference.features.fields],
      "BrowserLeaks Feature Checklist": browserLeaksReference.features.categories ?? {},
      "BrowserLeaks Sections": browserLeaksReference.features.sections ?? {},
      "BrowserLeaks Source": browserLeaksReference.features.source,
      "Detected / Tested Features": featureMatrix,
    },
    fonts: {
      "BrowserLeaks Fields": [...browserLeaksReference.fonts.fields],
      "BrowserLeaks Sections": browserLeaksReference.fonts.sections ?? {},
      "BrowserLeaks Source": browserLeaksReference.fonts.source,
      "Canvas Hash": signals.canvasHash,
      "Detected Fonts": fonts,
      "Font Count": fonts.length,
      "Language": browser.language,
      "Languages": browser.languages,
      "Platform": system.platform,
      "Text Metrics": canvas.textMetrics,
      "User Agent": userAgent,
    },
    geolocation: {
      "BrowserLeaks Fields": [...browserLeaksReference.geolocation.fields],
      "BrowserLeaks Sections": browserLeaksReference.geolocation.sections ?? {},
      "BrowserLeaks Source": browserLeaksReference.geolocation.source,
      "Browser Permission": privacy.geolocationPermission,
      "Camera Permission": privacy.cameraPermission,
      "Country": network.country,
      "Country Code": network.countryCode,
      "IP Address": network.ipAddress,
      "Latitude": network.latitude,
      "Local Timezone": timezone,
      "Location": network.city,
      "Longitude": network.longitude,
      "Microphone Permission": privacy.microphonePermission,
      "Provider Timezone": network.timezone,
      "VPN": network.vpn,
    },
    ipAddress: {
      "BrowserLeaks Fields": [...browserLeaksReference.ipAddress.fields],
      "BrowserLeaks Sections": browserLeaksReference.ipAddress.sections ?? {},
      "BrowserLeaks Source": browserLeaksReference.ipAddress.source,
      "ASN": network.asn,
      "City / Region": network.city,
      "Connection Type": network.connectionType,
      "Country": network.country,
      "Country Code": network.countryCode,
      "DNS Leak": network.dnsLeak,
      "Hosting": network.hosting,
      ...headerEntries,
      "IP Address": network.ipAddress,
      "IP Reputation": network.ipReputation,
      "IP Version": network.ipVersion,
      "ISP / Organization": network.isp,
      "Latitude": network.latitude,
      "Longitude": network.longitude,
      "Proxy": network.proxy,
      "Timezone": network.timezone,
      "Tor": network.tor,
      "VPN": network.vpn,
      "WebRTC Addresses": network.webRtcAddresses,
    },
    javaScript: {
      "BrowserLeaks Fields": [...browserLeaksReference.javaScript.fields],
      "BrowserLeaks Sections": browserLeaksReference.javaScript.sections ?? {},
      "BrowserLeaks Source": browserLeaksReference.javaScript.source,
      "App Code Name": (navigator as NavigatorExtras).appCodeName ?? unavailable,
      "App Name": (navigator as NavigatorExtras).appName ?? unavailable,
      "App Version": (navigator as NavigatorExtras).appVersion ?? unavailable,
      "Battery": system.battery,
      "Client Hints": clientHints,
      "Connection Downlink": (navigator as NavigatorExtras).connection?.downlink ?? null,
      "Connection Effective Type": connectionType,
      "Connection RTT": (navigator as NavigatorExtras).connection?.rtt ?? null,
      "Connection Save Data": (navigator as NavigatorExtras).connection?.saveData ?? null,
      "Cookies Enabled": browser.cookies,
      "Device Memory": system.deviceMemory,
      "Do Not Track": browser.doNotTrack,
      "Hardware Concurrency": system.hardwareConcurrency,
      "IndexedDB": browser.indexedDb,
      "Language": browser.language,
      "Languages": browser.languages,
      "Local Storage": browser.localStorage,
      "Local Time": localDate.toString(),
      "Max Touch Points": navigator.maxTouchPoints,
      "Media Device Count": mediaDeviceCount,
      "MIME Types": mimeTypes,
      "Online": navigator.onLine,
      "PDF Viewer": (navigator as NavigatorExtras).pdfViewerEnabled ?? null,
      "Platform": system.platform,
      "Plugins": plugins,
      "Product": (navigator as NavigatorExtras).product ?? unavailable,
      "Product Sub": (navigator as NavigatorExtras).productSub ?? unavailable,
      "Referrer": browser.referrer,
      "Screen Available": screenFingerprint.availableResolution,
      "Screen Color Depth": screenFingerprint.colorDepth,
      "Screen Pixel Depth": screenFingerprint.pixelDepth,
      "Screen Refresh Rate": refreshRate,
      "Screen Resolution": screenFingerprint.resolution,
      "Session Storage": browser.sessionStorage,
      "Timezone": timezone,
      "Touch Support": system.touchSupport,
      "User Activation": navigator.userActivation
        ? {
            hasBeenActive: navigator.userActivation.hasBeenActive,
            isActive: navigator.userActivation.isActive,
          }
        : null,
      "User Agent": userAgent,
      "Vendor": (navigator as NavigatorExtras).vendor ?? unavailable,
      "Vendor Sub": (navigator as NavigatorExtras).vendorSub ?? unavailable,
      "Viewport": screenFingerprint.viewport,
      "WebDriver": privacy.webDriver,
    },
    tls: {
      "BrowserLeaks Fields": [...browserLeaksReference.tls.fields],
      "BrowserLeaks JSON Source": "https://tls.browserleaks.com/json",
      "BrowserLeaks Sections": browserLeaksReference.tls.sections ?? {},
      "BrowserLeaks Source": browserLeaksReference.tls.source,
      "Accept": headers.accept ?? unavailable,
      "Accept-Encoding": headers["accept-encoding"] ?? unavailable,
      "Accept-Language": headers["accept-language"] ?? browser.language,
      "Akamai Hash": browserLeaksTls?.akamai_hash ?? unavailable,
      "Akamai Text": browserLeaksTls?.akamai_text ?? unavailable,
      "Cipher Suites": browserLeaksTlsCipherSuites.length ? browserLeaksTlsCipherSuites : unavailable,
      "ECH": unavailable,
      "HTTP Host": headers.host ?? unavailable,
      "JA3": browserLeaksTls?.ja3_hash ?? unavailable,
      "JA3_n": browserLeaksTls?.ja3n_hash ?? unavailable,
      "JA3_n Text": browserLeaksTls?.ja3n_text ?? unavailable,
      "JA3 Text": browserLeaksTls?.ja3_text ?? unavailable,
      "JA4": browserLeaksTls?.ja4 ?? unavailable,
      "JA4_o": browserLeaksTls?.ja4_o ?? unavailable,
      "JA4_r": browserLeaksTls?.ja4_r ?? unavailable,
      "JA4_ro": browserLeaksTls?.ja4_ro ?? unavailable,
      "Protocol": headers["x-forwarded-proto"] ?? headers["x-forwarded-protocol"] ?? unavailable,
      "Sec-CH-UA": headers["sec-ch-ua"] ?? unavailable,
      "Sec-CH-UA-Arch": headers["sec-ch-ua-arch"] ?? unavailable,
      "Sec-CH-UA-Bitness": headers["sec-ch-ua-bitness"] ?? unavailable,
      "Sec-CH-UA-Full-Version-List": headers["sec-ch-ua-full-version-list"] ?? unavailable,
      "Sec-CH-UA-Mobile": headers["sec-ch-ua-mobile"] ?? unavailable,
      "Sec-CH-UA-Platform": headers["sec-ch-ua-platform"] ?? unavailable,
      "Sec-CH-UA-Platform-Version": headers["sec-ch-ua-platform-version"] ?? unavailable,
      "TLS Extensions": browserLeaksTlsExtensions.length ? browserLeaksTlsExtensions : unavailable,
      "User-Agent": headers["user-agent"] ?? userAgent,
    },
    webGl: {
      "BrowserLeaks Fields": [...browserLeaksReference.webGl.fields],
      "BrowserLeaks Sections": browserLeaksReference.webGl.sections ?? {},
      "BrowserLeaks Source": browserLeaksReference.webGl.source,
      "Context": webGl.contextName,
      "Context Attributes": webGl.contextAttributes,
      "Extensions": webGl.extensions,
      "Extensions Count": webGl.extensions.length,
      "GPU": system.gpu,
      "Parameters": webGl.parameters,
      "Renderer": webGl.renderer,
      "Screen Color Depth": screenFingerprint.colorDepth,
      "Screen Resolution": screenFingerprint.resolution,
      "Shading Language Version": webGl.shadingLanguageVersion,
      "Vendor": webGl.vendor,
      "Version": webGl.version,
    },
    webRtc: {
      "BrowserLeaks Fields": [...browserLeaksReference.webRtc.fields],
      "BrowserLeaks Sections": browserLeaksReference.webRtc.sections ?? {},
      "BrowserLeaks Source": browserLeaksReference.webRtc.source,
      "Connection Type": network.connectionType,
      "Data Channel": yesNo("RTCDataChannel" in window),
      "Exposed Addresses": network.webRtcAddresses,
      "Get User Media": yesNo(Boolean(navigator.mediaDevices?.getUserMedia)),
      "IP Address": network.ipAddress,
      "Local / Host Candidates": network.webRtcAddresses,
      "Permissions Policy": privacy.permissionsPolicy,
      "Proxy": network.proxy,
      "RTCPeerConnection": yesNo("RTCPeerConnection" in window),
      "Status": privacy.webRtc,
      "Tor": network.tor,
      "VPN": network.vpn,
    },
  };
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
    canvasFingerprint,
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
    clientHints,
    browserLeaksTls,
    browserLeaksReference,
    officialFingerprint,
  ] = await Promise.all([
    withTimeout(collectCanvasFingerprint(), unavailableCanvasFingerprint, 1_500),
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
    withTimeout<Record<string, FingerprintJsonValue>>(collectClientHints(extras), {}, 1_500),
    withTimeout<BrowserLeaksTlsPayload | null>(fetchBrowserLeaksTls(), null, 4_500),
    withTimeout<BrowserLeaksReference>(fetchBrowserLeaksReference(), fallbackBrowserLeaksReference, 12_000),
    withTimeout<OfficialFingerprintResult>(
      collectOfficialFingerprint(),
      { event: null, extended: null, identity: null },
      18_000,
    ),
  ]);

  const webGl = collectWebGl();
  const fonts = detectFonts();
  const plugins = Array.from(navigator.plugins ?? []).map((plugin) => plugin.name);
  const mimeTypes = Array.from(navigator.mimeTypes ?? []).map((mimeType) => {
    const suffix = mimeType.description ? ` (${mimeType.description})` : "";
    return `${mimeType.type}${suffix}`;
  });
  const mediaDevicePromise = navigator.mediaDevices?.enumerateDevices()
    .then((devices) => devices.length)
    .catch(() => 0) ?? Promise.resolve(0);
  const mediaDeviceCount = await withTimeout(mediaDevicePromise, 0, 1_500);
  const connectionType = extras.connection?.effectiveType ?? extras.connection?.type ?? "Browser protected";
  const security = ipPayload.security;
  const canvasHash = canvasFingerprint.hash === unavailable
    ? unavailable
    : canvasFingerprint.hash.slice(0, 16);

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
    mimeTypeCount: mimeTypes.length,
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

  const providerEvent = officialFingerprint.event;
  const providerExtended = officialFingerprint.extended;
  const providerBrowserName = providerEvent?.browserName ?? providerExtended?.browserName;
  const providerBrowserVersion = providerEvent?.browserVersion ?? providerExtended?.browserVersion;
  const providerIpAddress = providerEvent?.ipAddress ?? providerExtended?.ipAddress;
  const providerCity = providerEvent?.city ?? providerExtended?.city;
  const providerCountry = providerEvent?.country ?? providerExtended?.country;
  const providerCountryCode = providerEvent?.countryCode ?? providerExtended?.countryCode;
  const providerLatitude = providerEvent?.latitude ?? providerExtended?.latitude;
  const providerLongitude = providerEvent?.longitude ?? providerExtended?.longitude;
  const providerTimezone = providerEvent?.timezone ?? providerExtended?.timezone;
  const providerOs = providerEvent?.os ?? providerExtended?.os;
  const providerOsVersion = providerEvent?.osVersion ?? providerExtended?.osVersion;

  if (providerBrowserName) browser.name = providerBrowserName;
  if (providerBrowserVersion) browser.version = providerBrowserVersion;
  if (providerIpAddress) {
    network.ipAddress = providerIpAddress;
    network.ipVersion = providerIpAddress.includes(":") ? "IPv6" : "IPv4";
  }
  if (providerCity || providerCountry) {
    network.city = [providerCity, providerCountry].filter(Boolean).join(", ");
  }
  if (providerCountry) network.country = providerCountry;
  if (providerCountryCode) network.countryCode = providerCountryCode;
  if (providerLatitude !== null && providerLatitude !== undefined) {
    network.latitude = providerLatitude;
  }
  if (providerLongitude !== null && providerLongitude !== undefined) {
    network.longitude = providerLongitude;
  }
  if (providerTimezone) network.timezone = providerTimezone;
  if (providerEvent?.asn) network.asn = providerEvent.asn;
  if (providerEvent?.isp) network.isp = providerEvent.isp;
  if (providerEvent?.vpn !== null && providerEvent?.vpn !== undefined) {
    network.vpn = providerEvent.vpn;
  }
  if (providerEvent?.proxy !== null && providerEvent?.proxy !== undefined) {
    network.proxy = providerEvent.proxy;
  }
  if (providerEvent?.tor !== null && providerEvent?.tor !== undefined) {
    network.tor = providerEvent.tor;
  }
  if (providerEvent?.hosting !== null && providerEvent?.hosting !== undefined) {
    network.hosting = providerEvent.hosting;
  }
  if (providerEvent?.ipBlocklist === true) network.ipReputation = "Blocklist match detected";
  if (providerEvent?.ipBlocklist === false) network.ipReputation = "No blocklist match";
  if (providerOs) system.os = providerOs;
  if (providerOsVersion) system.osVersion = providerOsVersion;
  if (providerEvent?.bot === true) privacy.automationFlags = "Detected";

  const scores = buildScores(browser, network, privacy, signals);
  if (providerEvent?.suspectScore !== null && providerEvent?.suspectScore !== undefined) {
    scores.riskScore = clamp(providerEvent.suspectScore);
    scores.riskLabel = scores.riskScore <= 25
      ? "Low"
      : scores.riskScore <= 55
        ? "Medium"
        : "High";
  }
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
  const identity = officialFingerprint.identity?.visitorId
    ? {
        ...officialFingerprint.identity,
        visitorId: providerEvent?.visitorId ?? officialFingerprint.identity.visitorId,
      }
    : {
        confidence: null,
        provider: "local" as const,
        requestId: null,
        visitorFound: null,
        visitorId: compositeHash.slice(0, 20),
      };
  const smartSignals: FingerprintSmartSignals = {
    bot: providerEvent?.bot ?? null,
    developerTools: providerEvent?.developerTools ?? null,
    highActivityDevice: providerEvent?.highActivityDevice ?? null,
    incognito: providerEvent?.incognito ?? providerExtended?.incognito ?? null,
    ipBlocklist: providerEvent?.ipBlocklist ?? null,
    privacySettings: providerEvent?.privacySettings ?? null,
    rareDevice: providerEvent?.rareDevice ?? null,
    tampering: providerEvent?.tampering ?? null,
    virtualMachine: providerEvent?.virtualMachine ?? null,
  };
  const browserLeaks = buildBrowserLeakSections({
    browser,
    browserLeaksReference,
    browserLeaksTls,
    canvas: canvasFingerprint,
    clientHints,
    compositeHash,
    connectionType,
    fonts,
    headers,
    mediaDeviceCount,
    mimeTypes,
    network,
    plugins,
    privacy,
    refreshRate,
    screenFingerprint,
    signals,
    smartSignals,
    system,
    timezone,
    userAgent,
    webGl,
  });

  return {
    browser,
    browserLeaks,
    collectedAt: new Date().toISOString(),
    compositeHash,
    headers,
    identity,
    network,
    privacy,
    scores,
    screen: screenFingerprint,
    sessionId,
    signals,
    smartSignals,
    status: hasCoreSignals ? "complete" : "partial",
    system,
  };
}

export function formatNetworkFlag(value: boolean | null) {
  return formatBoolean(value, "Detected", "Not detected");
}
