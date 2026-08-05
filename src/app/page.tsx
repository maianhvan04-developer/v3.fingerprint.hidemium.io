"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import World from "@react-map/world";
import {
  Activity,
  ArrowRight,
  Check,
  CircleCheck,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  FileJson,
  Fingerprint,
  Globe2,
  LockKeyhole,
  MapPin,
  Monitor,
  Network,
  Play,
  Shield,
  ShieldCheck,
  Sparkles,
  Wifi,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { formatNetworkFlag } from "@/lib/fingerprint/collector";
import { useFingerprintScan } from "@/hooks/use-fingerprint-scan";
import type { FingerprintRow, FingerprintSnapshot, ValueTone } from "@/types/fingerprint";

type DetailTab = "Overview" | "Browser" | "Network" | "Fingerprint" | "Privacy" | "System" | "Screen" | "Raw Data";

interface DetailCardData {
  icon: ReactNode;
  key: Exclude<DetailTab, "Overview" | "Raw Data">;
  rows: FingerprintRow[];
  title: string;
}

const tabs: DetailTab[] = ["Overview", "Browser", "Network", "Fingerprint", "Privacy", "System", "Screen", "Raw Data"];
const trustedBrands = [
  { key: "checkout", label: "checkout.com" },
  { key: "sumsub", label: "sumsub" },
  { key: "seon", label: "SEON" },
  { key: "riskified", label: "riskified" },
  { key: "sift", label: "sift" },
  { key: "forter", label: "FORTER" },
  { key: "veriff", label: "veriff" },
  { key: "datadome", label: "DataDome" },
] as const;

function shortValue(value: string, length = 24) {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1)}…`;
}

function toneForDetection(value: string, inverse = false): ValueTone {
  const detected = /detected|possible|exposure/i.test(value) && !/not detected|no leak/i.test(value);
  if (detected) return inverse ? "good" : "warn";
  return inverse ? "warn" : "good";
}

function formatDate(isoDate?: string) {
  if (!isoDate) return "Collecting browser signals…";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    second: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate));
}

function ScoreSparkline({ tone }: { tone: "cyan" | "blue" | "purple" | "green" }) {
  return (
    <svg className={`score-sparkline score-sparkline--${tone}`} viewBox="0 0 112 20" aria-hidden="true">
      <path d="M1 16 15 13 27 15 41 8 55 11 68 5 81 9 95 4 111 7" />
    </svg>
  );
}

function ChromeLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="chrome-red" x1="3.2173" y1="15" x2="44.7812" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d93025" />
          <stop offset="1" stopColor="#ea4335" />
        </linearGradient>
        <linearGradient id="chrome-yellow" x1="20.7219" y1="47.6791" x2="41.5039" y2="11.6837" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fcc934" />
          <stop offset="1" stopColor="#fbbc04" />
        </linearGradient>
        <linearGradient id="chrome-green" x1="26.5981" y1="46.5015" x2="5.8161" y2="10.506" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1e8e3e" />
          <stop offset="1" stopColor="#34a853" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="23.9947" r="12" fill="#fff" />
      <path d="M24 12h20.781A23.994 23.994 0 0 0 3.217 12.003L13.608 30l.009-.002A11.985 11.985 0 0 1 24 12Z" fill="url(#chrome-red)" />
      <circle cx="24" cy="24" r="9.5" fill="#1a73e8" />
      <path d="M34.391 30.003 24.001 48A23.994 23.994 0 0 0 44.78 12.003H23.999l-.003.009a11.985 11.985 0 0 1 10.395 17.991Z" fill="url(#chrome-yellow)" />
      <path d="M13.609 30.003 3.218 12.006A23.994 23.994 0 0 0 24.003 48l10.39-17.997-.007-.007a11.985 11.985 0 0 1-20.777.007Z" fill="url(#chrome-green)" />
    </svg>
  );
}

function WindowsLogo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path fill="#00a4ef" d="m3 5.8 11.4-1.6v10.9H3V5.8Z" />
      <path fill="#35c7ff" d="m16.1 4 12.9-1.8v12.9H16.1V4Z" />
      <path fill="#0089dc" d="M3 16.9h11.4v10.9L3 26.2v-9.3Z" />
      <path fill="#00a4ef" d="M16.1 16.9H29v12.9L16.1 28V16.9Z" />
    </svg>
  );
}

function BrowserMark({ name }: { name?: string }) {
  return /chrome|chromium/i.test(name ?? "") ? <ChromeLogo /> : <Globe2 aria-hidden="true" />;
}

function SystemMark({ name }: { name?: string }) {
  return /windows/i.test(name ?? "") ? <WindowsLogo /> : <Monitor aria-hidden="true" />;
}

function ScoreTile({
  icon,
  label,
  note,
  tone,
  value,
}: {
  icon: ReactNode;
  label: string;
  note: string;
  tone: "cyan" | "blue" | "purple" | "green";
  value: string;
}) {
  return (
    <article className={`score-tile score-tile--${tone}`}>
      <div className="score-tile__label">{icon}<span>{label}</span></div>
      <strong>{value}</strong>
      <small>{note}</small>
      <ScoreSparkline tone={tone} />
    </article>
  );
}

function FingerprintGauge({ score, size = "large" }: { score: number; size?: "large" | "small" }) {
  const circumference = 289;
  const dash = Math.max(0, Math.min(circumference, (score / 100) * circumference));
  return (
    <div className={`fingerprint-gauge fingerprint-gauge--${size}`}>
      <svg viewBox="0 0 112 112" aria-hidden="true">
        <defs>
          <linearGradient id={`gauge-gradient-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00e7ff" />
            <stop offset=".55" stopColor="#1687ff" />
            <stop offset="1" stopColor="#9a4dff" />
          </linearGradient>
        </defs>
        <circle className="fingerprint-gauge__track" cx="56" cy="56" r="46" />
        <circle
          className="fingerprint-gauge__progress"
          cx="56"
          cy="56"
          r="46"
          stroke={`url(#gauge-gradient-${size})`}
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <span className="fingerprint-gauge__icon"><Fingerprint aria-hidden="true" /></span>
    </div>
  );
}

function WorldMap({
  country,
  countryCode,
  latitude,
  location,
  longitude,
}: {
  country?: string;
  countryCode?: string;
  latitude?: number | null;
  location?: string;
  longitude?: number | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const hasCoordinates = typeof latitude === "number" && typeof longitude === "number";
  const countryName = useMemo(() => {
    if (countryCode) {
      try {
        return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode.toUpperCase()) ?? country ?? "";
      } catch {
        return country ?? "";
      }
    }
    return country ?? "";
  }, [country, countryCode]);
  const countryColors = useMemo(
    () => countryName ? { [countryName]: "#0d5485" } : {},
    [countryName],
  );

  useEffect(() => {
    const mapRoot = mapRef.current;
    if (!mapRoot || !countryName) {
      return;
    }

    let frame = 0;
    let observer: MutationObserver | null = null;
    let markerNode: SVGGElement | null = null;

    const syncMarker = () => {
      const countryPath = Array.from(mapRoot.querySelectorAll<SVGPathElement>("path"))
        .find((path) => path.id.startsWith(`${countryName}-`));
      const svg = countryPath?.ownerSVGElement;
      if (!countryPath || !svg) return;

      const bounds = countryPath.getBBox();
      const svgNamespace = "http://www.w3.org/2000/svg";
      const marker = document.createElementNS(svgNamespace, "g");
      const circles = [
        { className: "world-map__marker-glow", radius: 27 },
        { className: "world-map__marker-ring world-map__marker-ring--outer", radius: 18 },
        { className: "world-map__marker-ring world-map__marker-ring--outer world-map__marker-ring--delayed", radius: 18 },
        { className: "world-map__marker-ring", radius: 10 },
        { className: "world-map__marker-core", radius: 4 },
      ];

      markerNode?.remove();
      marker.setAttribute("class", "world-map__marker");
      marker.setAttribute("aria-hidden", "true");
      marker.setAttribute("transform", `translate(${bounds.x + bounds.width / 2} ${bounds.y + bounds.height / 2})`);
      circles.forEach(({ className, radius }) => {
        const circle = document.createElementNS(svgNamespace, "circle");
        circle.setAttribute("class", className);
        circle.setAttribute("r", String(radius));
        marker.appendChild(circle);
      });
      svg.appendChild(marker);
      markerNode = marker;
    };

    frame = window.requestAnimationFrame(() => {
      syncMarker();
      const svg = mapRoot.querySelector("svg");
      if (svg) {
        observer = new MutationObserver(syncMarker);
        observer.observe(svg, { attributeFilter: ["viewBox"], attributes: true });
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      markerNode?.remove();
    };
  }, [countryName]);

  const coordinateLabel = hasCoordinates
    ? `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
    : "Location pending";

  return (
    <div
      className="world-map"
      aria-label={`World map showing ${location || countryCode || "the detected IP location"} near ${coordinateLabel}`}
    >
      <div className="world-map__grid" aria-hidden="true" />
      <div className="world-map__stage" ref={mapRef}>
        <World
          cityColors={countryColors}
          disableClick
          disableHover
          mapColor="#092c4d"
          size={1000}
          strokeColor="#0d4774"
          strokeWidth={0.55}
          type="select-single"
        />
      </div>
      <span className="world-map__label">
        <MapPin aria-hidden="true" />
        <span>{countryCode || "GLOBAL"}</span>
        <small>{coordinateLabel}</small>
      </span>
    </div>
  );
}

function HeroConsole({ snapshot }: { snapshot: FingerprintSnapshot | null }) {
  const scores = snapshot?.scores;
  return (
    <div className="hero-console" aria-label="Live browser identity overview">
      <div className="hero-console__scores">
        <div className="identity-orb">
          <FingerprintGauge score={scores?.coverage ?? 28} />
          <span>Live identity</span>
        </div>
        <ScoreTile
          icon={<ShieldCheck aria-hidden="true" />}
          label="Risk Score"
          note={`${scores?.riskLabel ?? "Scanning"} risk`}
          tone="green"
          value={scores ? `${scores.riskScore}/100` : "--"}
        />
        <ScoreTile
          icon={<Fingerprint aria-hidden="true" />}
          label="Uniqueness"
          note="Local estimate"
          tone="blue"
          value={scores ? `${scores.uniqueness}%` : "--"}
        />
        <ScoreTile
          icon={<Shield aria-hidden="true" />}
          label="Anonymity"
          note={`${scores?.anonymityScore ?? 0}/100`}
          tone="purple"
          value={scores?.anonymityLabel ?? "--"}
        />
        <ScoreTile
          icon={<CircleCheck aria-hidden="true" />}
          label="Consistency"
          note="Cross-signal"
          tone="cyan"
          value={scores ? `${scores.consistency}%` : "--"}
        />
      </div>

      <div className="hero-console__identity">
        <div className="identity-list">
          <span className="mini-heading">Identity Overview</span>
          <dl>
            <div><dt><Globe2 /> IP Address</dt><dd>{snapshot?.network.ipAddress ?? "Scanning…"}</dd></div>
            <div><dt><MapPin /> Location</dt><dd>{snapshot?.network.city ?? "Scanning…"}</dd></div>
            <div><dt><Wifi /> ISP</dt><dd>{shortValue(snapshot?.network.isp ?? "Scanning…", 20)}</dd></div>
            <div><dt><Activity /> Timezone</dt><dd>{snapshot?.network.timezone ?? "Scanning…"}</dd></div>
            <div><dt><Shield /> VPN</dt><dd className={snapshot?.network.vpn ? "value-warn" : "value-good"}>{snapshot ? formatNetworkFlag(snapshot.network.vpn) : "Checking…"}</dd></div>
            <div><dt><Network /> WebRTC</dt><dd className={snapshot?.network.webRtcAddresses.length ? "value-warn" : "value-good"}>{snapshot?.privacy.webRtc ?? "Checking…"}</dd></div>
          </dl>
        </div>
        <WorldMap
          country={snapshot?.network.country}
          countryCode={snapshot?.network.countryCode}
          latitude={snapshot?.network.latitude}
          location={snapshot?.network.city}
          longitude={snapshot?.network.longitude}
        />
        <div className="browser-summary">
          <span className="mini-heading">Browser Summary</span>
          <div className="browser-chip">
            <span className="browser-chip__logo"><BrowserMark name={snapshot?.browser.name} /></span>
            <div><strong>{snapshot?.browser.name ?? "Detecting…"}</strong><small>Version {snapshot?.browser.version ?? "--"}</small></div>
          </div>
          <div className="browser-chip">
            <span className="browser-chip__logo browser-chip__logo--system"><SystemMark name={snapshot?.system.os} /></span>
            <div><strong>{snapshot?.system.os ?? "Detecting…"}</strong><small>{snapshot?.system.architecture ?? "--"}</small></div>
          </div>
          <div className="browser-user-agent">
            <span>User Agent</span>
            <code>{shortValue(snapshot?.browser.userAgent ?? "Collecting browser signature…", 78)}</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustBrandIcon({ brand }: { brand: (typeof trustedBrands)[number]["key"] }) {
  if (brand === "checkout") {
    return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M8 3h8l4 6-3 5 3 5-4 6H8l3.7-6L8.5 14l3.2-5L8 3Z" /><path d="M16 3 12.3 9l3.2 5-3.2 5L16 25" /></svg>;
  }
  if (brand === "sumsub") {
    return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="m3 10 6.5 1L14 4l4.5 7 6.5-1-4.8 5 3.8 6-7-2-3 5-3-5-7 2 3.8-6L3 10Z" /><path d="M7 14h14M9 17h10" /></svg>;
  }
  if (brand === "seon") {
    return <svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="10" /><path d="M8 14c2.5-5 9.5-5 12 0-2.5 5-9.5 5-12 0Z" /><path d="M11 14c1-2 5-2 6 0-1 2-5 2-6 0Z" /></svg>;
  }
  if (brand === "riskified") {
    return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="m3 17 7 6L25 6l-4-2-11 13-3-3-4 3Z" /><path d="m14 20 8 3 3-8" /></svg>;
  }
  if (brand === "sift") {
    return <svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="10" /><path d="M4 14h20M14 4c4 3 5 16 0 20M14 4c-4 3-5 16 0 20M7 8h14M7 20h14" /></svg>;
  }
  if (brand === "forter") {
    return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M4 5h20l-3 5H11l-2 4h10l-3 5H7l-2 4H1L9 5h-5Z" /></svg>;
  }
  if (brand === "veriff") {
    return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M3 6h6l5 14 5-14h6L17 24h-6L3 6Z" /><path d="m18 16 3 3 5-7" /></svg>;
  }
  return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M5 4h8c7 0 11 4 11 10S20 24 13 24H5V4Z" /><path d="M10 9h3c3.5 0 5.5 1.7 5.5 5s-2 5-5.5 5h-3V9Z" /></svg>;
}

function TrustBrand({ brand }: { brand: (typeof trustedBrands)[number] }) {
  return (
    <span className={`trust-brand trust-brand--${brand.key}`}>
      <TrustBrandIcon brand={brand.key} />
      <span>{brand.label}</span>
    </span>
  );
}

function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Trusted company examples">
      <span>Trusted by innovative companies worldwide</span>
      <div className="trust-bar__viewport">
        <div className="trust-bar__track">
          {[0, 1].map((copy) => (
            <div className="trust-bar__group" aria-hidden={copy === 1} key={copy}>
              {trustedBrands.map((brand) => <TrustBrand brand={brand} key={`${copy}-${brand.key}`} />)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DataCard({ actions, data }: { actions?: ReactNode; data: DetailCardData }) {
  return (
    <article className="data-card">
      <div className="data-card__header">
        <h3>{data.icon}{data.title}</h3>
        {actions ? <div className="data-card__actions">{actions}</div> : null}
      </div>
      <dl>
        {data.rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd className={row.tone ? `value-${row.tone}` : undefined}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function buildCards(snapshot: FingerprintSnapshot): DetailCardData[] {
  return [
    {
      icon: <Network aria-hidden="true" />,
      key: "Network",
      rows: [
        { label: "IP Address", value: snapshot.network.ipAddress, tone: "accent" },
        { label: snapshot.network.ipVersion, value: snapshot.network.ipVersion === "IPv6" ? snapshot.network.ipAddress : "Not detected" },
        { label: "Location", value: snapshot.network.city },
        { label: "Timezone", value: snapshot.network.timezone },
        { label: "ISP", value: snapshot.network.isp },
        { label: "ASN", value: snapshot.network.asn },
        { label: "Connection Type", value: snapshot.network.connectionType },
        { label: "Proxy", value: formatNetworkFlag(snapshot.network.proxy), tone: snapshot.network.proxy ? "warn" : "good" },
        { label: "VPN", value: formatNetworkFlag(snapshot.network.vpn), tone: snapshot.network.vpn ? "warn" : "good" },
        { label: "Tor", value: formatNetworkFlag(snapshot.network.tor), tone: snapshot.network.tor ? "warn" : "good" },
        { label: "Hosting", value: formatNetworkFlag(snapshot.network.hosting), tone: snapshot.network.hosting ? "warn" : "default" },
        { label: "WebRTC Leak", value: snapshot.privacy.webRtc, tone: toneForDetection(snapshot.privacy.webRtc) },
      ],
      title: "Network",
    },
    {
      icon: <Globe2 aria-hidden="true" />,
      key: "Browser",
      rows: [
        { label: "Name", value: snapshot.browser.name },
        { label: "Version", value: snapshot.browser.version },
        { label: "Engine", value: snapshot.browser.engine },
        { label: "User Agent", value: snapshot.browser.userAgent },
        { label: "Language", value: snapshot.browser.languages.join(", ") || snapshot.browser.language },
        { label: "Cookies", value: snapshot.browser.cookies ? "Enabled" : "Disabled", tone: snapshot.browser.cookies ? "good" : "warn" },
        { label: "Local Storage", value: snapshot.browser.localStorage ? "Enabled" : "Blocked", tone: snapshot.browser.localStorage ? "good" : "warn" },
        { label: "Session Storage", value: snapshot.browser.sessionStorage ? "Enabled" : "Blocked", tone: snapshot.browser.sessionStorage ? "good" : "warn" },
        { label: "IndexedDB", value: snapshot.browser.indexedDb ? "Enabled" : "Blocked", tone: snapshot.browser.indexedDb ? "good" : "warn" },
        { label: "Do Not Track", value: snapshot.browser.doNotTrack },
        { label: "Referrer", value: snapshot.browser.referrer },
        { label: "Plugins", value: String(snapshot.browser.plugins.length) },
      ],
      title: "Browser",
    },
    {
      icon: <Cpu aria-hidden="true" />,
      key: "System",
      rows: [
        { label: "OS", value: snapshot.system.os },
        { label: "OS Version", value: snapshot.system.osVersion },
        { label: "Platform", value: snapshot.system.platform },
        { label: "Architecture", value: snapshot.system.architecture },
        { label: "Device Memory", value: snapshot.system.deviceMemory },
        { label: "CPU Cores", value: String(snapshot.system.hardwareConcurrency || "Protected") },
        { label: "CPU", value: snapshot.system.cpu },
        { label: "GPU", value: snapshot.system.gpu },
        { label: "Battery Status", value: snapshot.system.battery },
        { label: "Touch Support", value: snapshot.system.touchSupport },
        { label: "Hardware Concurrency", value: String(snapshot.system.hardwareConcurrency || "Protected") },
        { label: "Page Uptime", value: snapshot.system.uptime },
      ],
      title: "System",
    },
    {
      icon: <Monitor aria-hidden="true" />,
      key: "Screen",
      rows: [
        { label: "Resolution", value: snapshot.screen.resolution },
        { label: "Available Resolution", value: snapshot.screen.availableResolution },
        { label: "Color Depth", value: snapshot.screen.colorDepth },
        { label: "Pixel Depth", value: snapshot.screen.pixelDepth },
        { label: "Device Pixel Ratio", value: snapshot.screen.devicePixelRatio },
        { label: "Refresh Rate", value: snapshot.screen.refreshRate },
        { label: "Orientation", value: snapshot.screen.orientation },
        { label: "HDR Support", value: snapshot.screen.hdr },
        { label: "Viewport Size", value: snapshot.screen.viewport },
        { label: "Zoom Level", value: snapshot.screen.zoomLevel },
      ],
      title: "Screen",
    },
    {
      icon: <Fingerprint aria-hidden="true" />,
      key: "Fingerprint",
      rows: [
        { label: "Canvas Fingerprint", value: snapshot.signals.canvasHash, tone: "accent" },
        { label: "WebGL Vendor", value: snapshot.signals.webGlVendor },
        { label: "WebGL Renderer", value: snapshot.signals.webGlRenderer },
        { label: "WebGL Version", value: snapshot.signals.webGlVersion },
        { label: "AudioContext Fingerprint", value: snapshot.signals.audioHash, tone: "accent" },
        { label: "Fonts Detected", value: String(snapshot.signals.fontCount) },
        { label: "Plugins Count", value: String(snapshot.signals.pluginCount) },
        { label: "MIME Types", value: String(snapshot.signals.mimeTypeCount) },
        { label: "Media Devices", value: String(snapshot.signals.mediaDeviceCount) },
        { label: "Speech Synthesis", value: snapshot.signals.speechSynthesis },
        { label: "Notification Permission", value: snapshot.signals.notificationPermission },
        { label: "Composite Hash", value: snapshot.compositeHash.slice(0, 24), tone: "accent" },
      ],
      title: "Fingerprint Signals",
    },
    {
      icon: <LockKeyhole aria-hidden="true" />,
      key: "Privacy",
      rows: [
        { label: "WebRTC", value: snapshot.privacy.webRtc, tone: toneForDetection(snapshot.privacy.webRtc) },
        { label: "Geolocation", value: snapshot.privacy.geolocationPermission },
        { label: "Camera", value: snapshot.privacy.cameraPermission },
        { label: "Microphone", value: snapshot.privacy.microphonePermission },
        { label: "Ad Blocker", value: snapshot.privacy.adBlocker, tone: toneForDetection(snapshot.privacy.adBlocker, true) },
        { label: "Automation Flags", value: snapshot.privacy.automationFlags, tone: toneForDetection(snapshot.privacy.automationFlags) },
        { label: "Headless", value: snapshot.privacy.headless, tone: toneForDetection(snapshot.privacy.headless) },
        { label: "WebDriver", value: snapshot.privacy.webDriver, tone: toneForDetection(snapshot.privacy.webDriver) },
        { label: "Permissions Policy", value: snapshot.privacy.permissionsPolicy },
        { label: "Cross-Origin Isolation", value: snapshot.privacy.crossOriginIsolation },
      ],
      title: "Privacy & Security",
    },
  ];
}

function RiskDonut({ snapshot }: { snapshot: FingerprintSnapshot }) {
  const score = snapshot.scores.riskScore;
  return (
    <article className="analysis-card risk-overview">
      <h3>Trust & Entropy</h3>
      <div className="risk-overview__body">
        <div className="risk-donut">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="49" />
            <circle className="risk-donut__progress" cx="60" cy="60" r="49" strokeDasharray={`${score * 3.08} ${308 - score * 3.08}`} />
          </svg>
          <div><strong>{score}</strong><small>/100</small><span>{snapshot.scores.riskLabel} Risk</span></div>
        </div>
        <dl>
          <div><dt>Uniqueness</dt><dd>{snapshot.scores.uniqueness}% <small>est.</small></dd></div>
          <div><dt>Consistency</dt><dd>{snapshot.scores.consistency}%</dd></div>
          <div><dt>Anonymity</dt><dd>{snapshot.scores.anonymityLabel}</dd></div>
          <div><dt>Signal Entropy</dt><dd>{snapshot.signals.canvasHash === "Unavailable" ? "Limited" : "High"}</dd></div>
        </dl>
      </div>
      <small className="analysis-note">Evaluation based on browser-visible signals; uniqueness is a local estimate.</small>
    </article>
  );
}

function RiskFactors({ snapshot }: { snapshot: FingerprintSnapshot }) {
  const factors = [
    { label: snapshot.network.proxy || snapshot.network.vpn || snapshot.network.tor ? "Anonymous network indicator detected" : "No suspicious network indicators", ok: !(snapshot.network.proxy || snapshot.network.vpn || snapshot.network.tor) },
    { label: snapshot.privacy.webDriver === "Detected" ? "Browser automation flag detected" : "No automation flags detected", ok: snapshot.privacy.webDriver !== "Detected" },
    { label: snapshot.scores.consistency >= 80 ? "Consistent browser fingerprint" : "Cross-signal mismatch detected", ok: snapshot.scores.consistency >= 80 },
    { label: "High-entropy fingerprint available", ok: snapshot.signals.canvasHash !== "Unavailable" },
  ];
  return (
    <article className="analysis-card risk-factors">
      <h3>Risk Factors</h3>
      <ul>{factors.map((factor) => <li key={factor.label} data-ok={factor.ok}>{factor.label}<CircleCheck aria-hidden="true" /></li>)}</ul>
      <div className="overall-risk"><span>Overall Risk</span><strong>{snapshot.scores.riskLabel}</strong></div>
    </article>
  );
}

function SignalCoverage({ snapshot }: { snapshot: FingerprintSnapshot }) {
  const coverage = [
    { label: "Network", value: snapshot.network.ipAddress === "Unavailable" ? 45 : 100 },
    { label: "Browser", value: 100 },
    { label: "Fingerprint", value: snapshot.signals.canvasHash === "Unavailable" ? 50 : 94 },
    { label: "Privacy", value: 88 },
    { label: "System", value: snapshot.system.deviceMemory.includes("protected") ? 78 : 96 },
    { label: "Screen", value: 100 },
  ];
  return (
    <article className="analysis-card signal-coverage">
      <div className="analysis-card__title"><h3>Signal Coverage</h3><span>{snapshot.scores.coverage}%</span></div>
      <div className="coverage-list">
        {coverage.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <progress max="100" value={item.value}>{item.value}%</progress>
            <small>{item.value}/100</small>
          </div>
        ))}
      </div>
      <div className="coverage-total"><span>Coverage</span><strong>{snapshot.scores.coverage}%</strong></div>
    </article>
  );
}

function RawData({ onCopy, onDownload, snapshot }: { onCopy: () => void; onDownload: () => void; snapshot: FingerprintSnapshot }) {
  return (
    <section className="raw-data" id="raw-data">
      <div className="raw-data__header">
        <div><FileJson aria-hidden="true" /><span><strong>Raw fingerprint JSON</strong><small>Generated locally in your browser</small></span></div>
        <div className="raw-data__actions">
          <button onClick={onCopy} type="button"><Copy aria-hidden="true" /> Copy JSON</button>
          <button onClick={onDownload} type="button"><Download aria-hidden="true" /> Download JSON</button>
        </div>
      </div>
      <pre>{JSON.stringify(snapshot, null, 2)}</pre>
    </section>
  );
}

function DetailDashboard({ snapshot }: { snapshot: FingerprintSnapshot | null }) {
  const [activeTab, setActiveTab] = useState<DetailTab>("Overview");
  const [copied, setCopied] = useState(false);
  const cards = useMemo(() => snapshot ? buildCards(snapshot) : [], [snapshot]);
  const visibleCards = activeTab === "Overview" ? cards : cards.filter((card) => card.key === activeTab);
  const selectedJson = useMemo(() => {
    if (!snapshot || activeTab === "Overview") return null;
    if (activeTab === "Browser") return { browser: snapshot.browser };
    if (activeTab === "Network") return { network: snapshot.network };
    if (activeTab === "Fingerprint") return { fingerprint: snapshot.signals };
    if (activeTab === "Privacy") return { privacy: snapshot.privacy };
    if (activeTab === "System") return { system: snapshot.system };
    if (activeTab === "Screen") return { screen: snapshot.screen };
    return snapshot;
  }, [activeTab, snapshot]);

  const copyJson = async () => {
    if (!selectedJson) return;
    await navigator.clipboard.writeText(JSON.stringify(selectedJson, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  };

  const downloadJson = () => {
    if (!selectedJson || !snapshot) return;
    const sectionName = activeTab.toLowerCase().replaceAll(" ", "-");
    const blob = new Blob([JSON.stringify(selectedJson, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fingerprint-${sectionName}-${snapshot.sessionId.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="detail-dashboard" id="details">
      <header className="detail-dashboard__header">
        <div>
          <span className="section-kicker">Live browser intelligence</span>
          <h2>Detailed Browser Fingerprint</h2>
          <p>AmIUnique-inspired analysis across browser, network, canvas, WebGL, media and privacy signals.</p>
        </div>
        <div className="session-meta">
          <span>Collected: {formatDate(snapshot?.collectedAt)}</span>
          <code>Session ID: {snapshot?.sessionId ?? "creating-session"}</code>
        </div>
      </header>

      <div className="detail-tabs" role="tablist" aria-label="Fingerprint categories">
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab}
            className={activeTab === tab ? "is-active" : undefined}
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {!snapshot ? (
        <div className="dashboard-loading">
          <span className="scan-loader"><Fingerprint aria-hidden="true" /></span>
          <strong>Collecting browser fingerprint</strong>
          <p>Reading canvas, WebGL, fonts, media, storage, network and privacy signals…</p>
        </div>
      ) : activeTab === "Raw Data" ? (
        <RawData onCopy={copyJson} onDownload={downloadJson} snapshot={snapshot} />
      ) : (
        <>
          <div className={activeTab === "Overview" ? "data-grid" : "data-grid data-grid--single"}>
            {visibleCards.map((card) => (
              <DataCard
                actions={activeTab === "Overview" ? undefined : (
                  <>
                    <button onClick={copyJson} type="button"><Copy aria-hidden="true" /> Copy JSON</button>
                    <button onClick={downloadJson} type="button"><Download aria-hidden="true" /> Download JSON</button>
                  </>
                )}
                data={card}
                key={card.key}
              />
            ))}
          </div>
          {activeTab === "Overview" ? (
            <div className="analysis-grid">
              <RiskDonut snapshot={snapshot} />
              <RiskFactors snapshot={snapshot} />
              <SignalCoverage snapshot={snapshot} />
            </div>
          ) : null}
        </>
      )}

      {copied ? <span className="copy-toast"><Check aria-hidden="true" /> {activeTab} JSON copied</span> : null}
    </section>
  );
}

function FinalCta({ onAnalyze, scanning }: { onAnalyze: () => void; scanning: boolean }) {
  return (
    <section className="final-cta">
      <div className="final-cta__glow"><Fingerprint aria-hidden="true" /></div>
      <div>
        <span className="section-kicker">Browser intelligence, made visible</span>
        <h2>Ready to understand your digital fingerprint?</h2>
        <p>Run a fresh local scan anytime. Your browser fingerprint stays in this tab unless you export it.</p>
        <div className="cta-trust"><span><ShieldCheck /> Local processing</span><span><LockKeyhole /> No fingerprint storage</span><span><Zap /> Live signals</span></div>
      </div>
      <div className="final-cta__actions">
        <button className="primary-button" disabled={scanning} onClick={onAnalyze} type="button">{scanning ? "Analyzing…" : "Analyze Again"}<ArrowRight /></button>
        <a className="secondary-button" href="https://amiunique.org/fr/fingerprint" rel="noreferrer" target="_blank">View AmIUnique <ExternalLink /></a>
      </div>
    </section>
  );
}

function Footer() {
  const columns = [
    { heading: "Product", links: ["Overview", "Features", "Pricing", "Integrations", "Status"] },
    { heading: "Solutions", links: ["Fraud Prevention", "Account Takeover", "Payment Protection", "Bot Detection", "Risk Management"] },
    { heading: "Developers", links: ["API Documentation", "SDKs", "Code Samples", "Changelog"] },
    { heading: "Company", links: ["About Us", "Research", "Privacy", "Contact Us"] },
  ];
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-brand">
        <a className="brand-lockup" href="#top"><span className="brand-mark"><Fingerprint /></span><span>Fingerprint Analyzer</span></a>
        <p>Browser fingerprint intelligence inspired by the public AmIUnique research project.</p>
        <a className="source-link" href="https://amiunique.org/faq" rel="noreferrer" target="_blank">Signal methodology <ExternalLink /></a>
      </div>
      <div className="footer-links">
        {columns.map((column) => <div key={column.heading}><strong>{column.heading}</strong>{column.links.map((link) => <a href="#details" key={link}>{link}</a>)}</div>)}
      </div>
      <div className="footer-newsletter">
        <strong>Stay updated</strong>
        <p>Get browser privacy and fraud prevention insights.</p>
        <form onSubmit={(event) => event.preventDefault()}><input aria-label="Email address" placeholder="Enter your email" type="email" /><button aria-label="Subscribe" type="submit"><ArrowRight /></button></form>
      </div>
      <div className="footer-bottom"><span>© 2026 Fingerprint Analyzer. Local diagnostic demonstration.</span><div><a href="#footer">Privacy Policy</a><a href="#footer">Terms of Service</a><a href="#footer">Security</a><span><Globe2 /> EN</span></div></div>
    </footer>
  );
}

export default function HomePage() {
  const { error, scan, snapshot, status } = useFingerprintScan();
  const scanning = status === "collecting";

  const startScan = () => {
    void scan();
    document.getElementById("details")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="site-shell" id="top">
      <SiteHeader onAnalyze={startScan} scanning={scanning} />
      <main>
        <section className="hero-section" id="overview">
          <div className="hero-network" aria-hidden="true" />
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles aria-hidden="true" /> AI-powered fingerprint intelligence</span>
            <h1>Know every browser.<br />Stop <span>fraud</span> with confidence.</h1>
            <p>See the browser signals that make every visitor distinct. Analyze network, device, canvas, WebGL and privacy attributes in real time.</p>
            <div className="hero-actions">
              <button className="primary-button" disabled={scanning} onClick={startScan} type="button">{scanning ? "Analyzing…" : "Analyze My Browser"}<ArrowRight aria-hidden="true" /></button>
              <a className="secondary-button" href="#details">Explore Signals <Play aria-hidden="true" /></a>
            </div>
            <div className="hero-trust"><span><ShieldCheck /> Runs locally</span><span><LockKeyhole /> No fingerprint storage</span><span><Code2 /> Exportable JSON</span></div>
            {error ? <p className="scan-error">Some signals were blocked: {error}</p> : null}
          </div>
          <HeroConsole snapshot={snapshot} />
        </section>
        <div className="page-container">
          <TrustBar />
          <DetailDashboard snapshot={snapshot} />
          <FinalCta onAnalyze={startScan} scanning={scanning} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
