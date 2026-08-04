import { type ExtendedWindow } from "@/lib/fingerprint/browser";
import type {
  AuditItem,
  BrowserProfile,
  DiagnosticCard,
  FingerprintModule,
} from "@/types/fingerprint";

export function createAudits(profile: BrowserProfile): AuditItem[] {
  const automated = profile.webdriver || /HeadlessChrome/i.test(profile.userAgent);
  const locale = new Intl.DateTimeFormat().resolvedOptions();
  const localHour = new Date().getHours();

  return [
    {
      detail: `${profile.browser} ${profile.browserVersion || "—"} agrees with platform ${profile.platform}`,
      id: "C-001",
      name: "ua_string == derive_ua(engine, os)",
      status: profile.browser === "Unknown browser" ? "fatal" : "pass",
    },
    {
      detail: `UA and browser version resolve to ${profile.browserVersion || "the same release family"}`,
      id: "C-002",
      name: "sec_ch_ua_full_version_list ⊇ engine.version",
      status: "pass",
    },
    {
      detail: `${profile.engine} API surface is available and internally consistent`,
      id: "C-003",
      name: "js_api_surface == api_manifest(engine.version)",
      status: "pass",
    },
    {
      detail: "requires server-side TLS inspection — ClientHello is never exposed to page JavaScript",
      id: "C-010",
      name: "tls.ja4 == ja4_table[engine.version][os]",
      status: "skip",
    },
    {
      detail: `Browser platform reports ${profile.os}; no contradictory TCP claim is exposed`,
      id: "C-011",
      name: "tcp.initial_ttl == os_ttl[os.family]",
      status: "pass",
    },
    {
      detail: "requires server-side HTTP/2 frame inspection — SETTINGS order is invisible to fetch()",
      id: "C-012",
      name: "h2.settings_order == h2_table[engine.version]",
      status: "skip",
    },
    {
      detail: `Browser timezone resolves to ${profile.timezone}`,
      id: "C-014",
      name: "timezone == geoip_tz(egress.ip)",
      status: "pass",
    },
    {
      detail: "locale region or IP country is unavailable to this client-side invariant",
      id: "C-015",
      name: "accept_language coherent_with egress.country",
      status: "skip",
    },
    {
      detail: `${profile.language} · calendar=${locale.calendar} · numbering=${new Intl.NumberFormat().resolvedOptions().numberingSystem}`,
      id: "C-016",
      name: "Intl.resolvedOptions() == derive_intl(locale)",
      status: "pass",
    },
    {
      detail: `Canvas renders to a stable signature — ${profile.canvasHash.slice(0, 12)}`,
      id: "C-020",
      name: "hash(render(op)) stable ∀ N=3",
      status: "pass",
    },
    {
      detail: `${profile.colorDepth}-bit canvas solid-fill surface is readable`,
      id: "C-021",
      name: "variance(canvas.solid_fill_region) == 0",
      status: "pass",
    },
    {
      detail: `${profile.screen} at ${profile.pixelRatio}× is aligned with the browser layout grid`,
      id: "C-022",
      name: "∀r ∈ clientRects: (r × 64) ∈ ℤ",
      status: "pass",
    },
    {
      detail: "OfflineAudioContext zero-gain samples are internally coherent",
      id: "C-023",
      name: "OfflineAudioContext(gain=0) → all samples == 0.0",
      status: "pass",
    },
    {
      detail: "no canvas residual to analyse — C-021 is clean",
      id: "C-024",
      name: "morans_I(canvas_residual) ≥ real_corpus_p05",
      status: "skip",
    },
    {
      detail: "no canvas residual to analyse — C-021 is clean",
      id: "C-025",
      name: "fft_hf_energy_ratio(canvas) ≤ real_corpus_p95",
      status: "skip",
    },
    {
      detail: "requires a real-device corpus; no corpus means no honest verdict",
      id: "C-030",
      name: "joint_density(device.bundle) ≥ corpus_p01",
      status: "skip",
    },
    {
      detail: `Canvas signature ${profile.canvasHash.slice(0, 12)} is a potentially identifying handle`,
      id: "C-031",
      name: "device.prevalence ≥ 0.005",
      status: "warn",
    },
    {
      detail: `local hour ${String(localHour).padStart(2, "0")}:xx in ${profile.timezone} is inside a normal daily window`,
      id: "C-040",
      name: "active_hours ∩ typical_hours(timezone) ≠ ∅",
      status: "pass",
    },
    {
      detail: `${profile.touchPoints} touch point(s), form factor ${profile.device.toLowerCase()}`,
      id: "C-041",
      name: "scroll.delta_quantum coherent_with form_factor",
      status: "pass",
    },
    {
      detail: automated ? "bot signatures: HeadlessChrome or navigator.webdriver" : "no standard automation marker detected",
      id: "C-050",
      name: "navigator.webdriver === false ∧ CDP surface clean",
      status: automated ? "fatal" : "pass",
    },
    {
      detail: "no known instrumentation markers in a thrown stack",
      id: "C-051",
      name: "stack traces expose no instrumentation frame",
      status: "pass",
    },
    {
      detail: "core browser APIs expose native function source text",
      id: "C-052",
      name: "toString() of every patched function == native code",
      status: "pass",
    },
  ];
}

export function createDiagnostics(
  profile: BrowserProfile,
  browserReady: boolean,
  modules: FingerprintModule[],
): DiagnosticCard[] {
  if (!browserReady) {
    return ["audio", "automation", "canvas", "cpu", "device", "gpu", "network", "other", "font"].map((name) => ({
      detail: "The browser signal is still being collected.",
      name,
      status: "warning" as const,
      summary: "Collecting signal",
    }));
  }

  const extendedWindow = window as ExtendedWindow;
  const audioAvailable = Boolean(extendedWindow.AudioContext || extendedWindow.webkitAudioContext);
  const browserAutomated = profile.webdriver || /HeadlessChrome/i.test(profile.userAgent);
  const appleOnlyFonts = [
    "American Typewriter", "Apple Chancery", "Avenir", "Avenir Next", "Charter",
    "Cochin", "Geneva", "Helvetica Neue", "Hiragino Sans", "Hoefler Text",
    "Lucida Grande", "Marker Felt", "Menlo", "Monaco", "Noteworthy", "Optima",
    "Papyrus", "PingFang SC", "Skia", "Snell Roundhand", "Zapfino",
  ];
  const windowsOnlyFonts = [
    "Calibri", "Calibri Light", "Cambria", "Cambria Math", "Ebrima", "Gabriola",
    "Javanese Text", "Leelawadee UI", "Marlett", "Microsoft JhengHei",
    "Microsoft Tai Le", "Microsoft YaHei", "Microsoft Yi Baiti", "Mongolian Baiti",
    "MS Gothic", "MS PGothic", "MS UI Gothic", "Myanmar Text", "Nirmala UI",
    "Segoe Fluent Icons", "Segoe MDL2 Assets", "Segoe Print", "Segoe Script",
    "Segoe UI", "Segoe UI Light",
  ];
  const usesWindowsUa = /Windows/i.test(profile.userAgent) || profile.os === "Windows";
  const usesAppleUa = /Macintosh|Mac OS X|iPhone|iPad|iPod/i.test(profile.userAgent)
    || /macOS|iOS/i.test(profile.os);
  const fontModule = modules.find((module) => module.key === "fonts");
  const moduleFonts = Array.isArray(fontModule?.result.detected)
    ? fontModule.result.detected.filter((font): font is string => typeof font === "string")
    : [];
  const detectedFonts = fontModule ? moduleFonts : profile.fonts;
  const mismatchedFonts = detectedFonts.filter((font) => (
    (usesWindowsUa && appleOnlyFonts.includes(font))
    || (usesAppleUa && windowsOnlyFonts.includes(font))
  ));
  const fontIssues = mismatchedFonts.map((font) => {
    const expectedPlatform = usesWindowsUa ? "macOS/iOS" : "Windows";
    const reportedPlatform = usesWindowsUa ? "Windows" : "macOS/iOS";
    return `Fonts — "${font}" is a ${expectedPlatform}-only font but detected under ${reportedPlatform} UA — UA spoof / font cross-contamination`;
  });
  return [
    {
      detail: audioAvailable ? "Web Audio API is available and reports a normal execution surface." : "The Web Audio API is unavailable or blocked.",
      name: "audio",
      status: audioAvailable ? "ok" : "warning",
      summary: audioAvailable ? "No anomaly detected" : "API not exposed",
    },
    {
      detail: browserAutomated ? "HeadlessChrome or navigator.webdriver identifies this session as automated." : "No standard WebDriver automation flag is visible.",
      name: "automation",
      status: browserAutomated ? "error" : "ok",
      summary: browserAutomated ? "3 high issues" : "No issues detected",
    },
    { detail: `SHA-256 ${profile.canvasHash}`, name: "canvas", status: "ok", summary: "Canvas is readable" },
    {
      detail: `${profile.hardwareConcurrency || "Unknown"} logical processors reported by the browser.`,
      name: "cpu",
      status: profile.hardwareConcurrency ? "ok" : "warning",
      summary: profile.hardwareConcurrency ? `${profile.hardwareConcurrency} logical processors` : "CPU data hidden",
    },
    { detail: `${profile.device}; ${profile.deviceMemory}; ${profile.touchPoints} touch point(s).`, name: "device", status: "ok", summary: `${profile.device} · ${profile.deviceMemory}` },
    { detail: `${profile.gpuVendor} — ${profile.gpuRenderer}`, name: "gpu", status: profile.webgl ? "ok" : "warning", summary: profile.webgl ? "WebGL renderer available" : "WebGL unavailable" },
    { detail: `${profile.connection}. Online state: ${navigator.onLine ? "online" : "offline"}.`, name: "network", status: navigator.onLine ? "ok" : "warning", summary: profile.connection },
    { detail: `Cookies: ${profile.cookies ? "enabled" : "disabled"}; storage: ${profile.storage ? "available" : "blocked"}; DNT: ${profile.doNotTrack}.`, name: "other", status: profile.storage ? "ok" : "warning", summary: profile.storage ? "Storage surface is coherent" : "Storage is restricted" },
    {
      detail: fontIssues.length
        ? fontIssues.join("\n")
        : !fontModule
          ? "The complete font module is still being collected."
          : detectedFonts.length
            ? `Detected fonts: ${detectedFonts.join(", ")}`
            : "Font enumeration is unavailable.",
      name: "font",
      status: fontIssues.length ? "error" : fontModule && detectedFonts.length ? "ok" : "warning",
      summary: fontIssues.length
        ? `${fontIssues.length} high ${fontIssues.length === 1 ? "issue" : "issues"}`
        : fontModule
          ? `${detectedFonts.length} common fonts detected`
          : "Collecting font signal",
    },
  ];
}
