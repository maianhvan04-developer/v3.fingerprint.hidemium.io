"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  FileJson,
  Fingerprint,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  Monitor,
  Network,
  Play,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { FingerprintLiveDemo } from "@/components/fingerprint-demo/fingerprint-live-demo";
import {
  BrowserSmartSignals,
  IdentificationSignals,
} from "@/components/fingerprint-demo/signal-panels";
import { SuspectSignalTable } from "@/components/fingerprint-demo/suspect-signal-table";
import { SiteHeader } from "@/components/layout/site-header";
import { formatNetworkFlag } from "@/lib/fingerprint/collector";
import { useFingerprintScan } from "@/hooks/use-fingerprint-scan";
import type { FingerprintRow, FingerprintSnapshot, ValueTone } from "@/types/fingerprint";

type DetailTab = "Overview" | "Browser" | "Network" | "Fingerprint" | "Privacy" | "System" | "Screen" | "Raw Data";
type ConsoleMode = "identification" | "browser" | "live";

interface DetailCardData {
  icon: ReactNode;
  key: Exclude<DetailTab, "Overview" | "Raw Data">;
  rows: FingerprintRow[];
  title: string;
}

const detailTabs: Array<{ icon: ReactNode; label: DetailTab }> = [
  { icon: <LayoutDashboard aria-hidden="true" />, label: "Overview" },
  { icon: <Globe2 aria-hidden="true" />, label: "Browser" },
  { icon: <Network aria-hidden="true" />, label: "Network" },
  { icon: <Fingerprint aria-hidden="true" />, label: "Fingerprint" },
  { icon: <LockKeyhole aria-hidden="true" />, label: "Privacy" },
  { icon: <Cpu aria-hidden="true" />, label: "System" },
  { icon: <Monitor aria-hidden="true" />, label: "Screen" },
  { icon: <FileJson aria-hidden="true" />, label: "Raw Data" },
];
const consoleModes: Array<{ id: ConsoleMode; index: string; label: string; workspaceLabel: string }> = [
  { id: "live", index: "01", label: "Live identity", workspaceLabel: "Visitor intelligence" },
  { id: "identification", index: "02", label: "Identification signals", workspaceLabel: "Identification signals" },
  { id: "browser", index: "03", label: "Browser smart signals", workspaceLabel: "Browser smart signals" },
];
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

function toneForDetection(value: string, inverse = false): ValueTone {
  const detected = /detected|possible|exposure/i.test(value) && !/not detected|no leak/i.test(value);
  if (detected) return inverse ? "good" : "warn";
  return inverse ? "warn" : "good";
}

function toneForFlag(value: boolean | null): ValueTone {
  return value === true ? "warn" : value === false ? "good" : "default";
}

function HeroConsole({
  onCalculationClick,
  onTrustedExampleChange,
  scanning,
  showTrustedExample,
  snapshot,
}: {
  onCalculationClick: () => void;
  onTrustedExampleChange: (value: boolean) => void;
  scanning: boolean;
  showTrustedExample: boolean;
  snapshot: FingerprintSnapshot | null;
}) {
  const [activeMode, setActiveMode] = useState<ConsoleMode>("live");
  const activeModeDetails = consoleModes.find((mode) => mode.id === activeMode) ?? consoleModes[0];

  return (
    <div className="hero-console" aria-label="Live browser identity overview">
      <div className="hero-console__titlebar">
        <span className="hero-console__controls" aria-hidden="true"><i /><i /><i /></span>
        <div className="hero-console__modes" aria-label="Browser intelligence views" role="tablist">
          {consoleModes.map((mode) => (
            <button
              aria-controls={`console-panel-${mode.id}`}
              aria-selected={activeMode === mode.id}
              className={activeMode === mode.id ? "hero-console__mode--active" : undefined}
              id={`console-tab-${mode.id}`}
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              role="tab"
              tabIndex={activeMode === mode.id ? 0 : -1}
              type="button"
            >
              <small>{mode.index}</small>{mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hero-console__workspace">
        <div className="hero-console__workspace-header">
          <span><i aria-hidden="true" />{scanning ? "SCANNING" : "LIVE"}</span>
          <strong>{activeModeDetails.workspaceLabel}_</strong>
        </div>
        <div
          aria-labelledby={`console-tab-${activeMode}`}
          className="hero-console__panel"
          id={`console-panel-${activeMode}`}
          key={activeMode}
          role="tabpanel"
        >
          {activeMode === "identification" ? (
            <IdentificationSignals scanning={scanning} snapshot={snapshot} />
          ) : activeMode === "browser" ? (
            <BrowserSmartSignals scanning={scanning} snapshot={snapshot} />
          ) : (
            <FingerprintLiveDemo
              onCalculationClick={onCalculationClick}
              onTrustedExampleChange={onTrustedExampleChange}
              scanning={scanning}
              showTrustedExample={showTrustedExample}
              snapshot={snapshot}
            />
          )}
        </div>
      </div>

      <div className="hero-console__statusbar">
        <span><i aria-hidden="true" />{snapshot?.identity.provider === "fingerprint-pro" ? "Fingerprint Pro" : "Local diagnostic"} · 7-day visit history</span>
        <span>{snapshot?.browser.name ?? "Browser"} {snapshot?.browser.version ?? "--"} · {snapshot?.system.os ?? "System"}</span>
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
  const providerLabel = snapshot.identity.provider === "fingerprint-pro"
    ? "Fingerprint Pro"
    : snapshot.identity.provider === "fingerprintjs"
      ? "FingerprintJS"
      : "Local collector";
  const confidence = snapshot.identity.confidence === null
    ? "Unavailable"
    : `${Math.round(snapshot.identity.confidence * 100)}%`;

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
        { label: "Proxy", value: formatNetworkFlag(snapshot.network.proxy), tone: toneForFlag(snapshot.network.proxy) },
        { label: "VPN", value: formatNetworkFlag(snapshot.network.vpn), tone: toneForFlag(snapshot.network.vpn) },
        { label: "Tor", value: formatNetworkFlag(snapshot.network.tor), tone: toneForFlag(snapshot.network.tor) },
        { label: "Hosting", value: formatNetworkFlag(snapshot.network.hosting), tone: toneForFlag(snapshot.network.hosting) },
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
        { label: "Visitor ID", value: snapshot.identity.visitorId, tone: "accent" },
        { label: "Identity Provider", value: providerLabel },
        { label: "Confidence", value: confidence },
        { label: "Request ID", value: snapshot.identity.requestId ?? "Unavailable" },
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
        { label: "Bot", value: formatNetworkFlag(snapshot.smartSignals.bot), tone: toneForFlag(snapshot.smartSignals.bot) },
        { label: "Incognito", value: formatNetworkFlag(snapshot.smartSignals.incognito), tone: toneForFlag(snapshot.smartSignals.incognito) },
        { label: "Tampering", value: formatNetworkFlag(snapshot.smartSignals.tampering), tone: toneForFlag(snapshot.smartSignals.tampering) },
        { label: "Virtual Machine", value: formatNetworkFlag(snapshot.smartSignals.virtualMachine), tone: toneForFlag(snapshot.smartSignals.virtualMachine) },
        { label: "Developer Tools", value: formatNetworkFlag(snapshot.smartSignals.developerTools), tone: toneForFlag(snapshot.smartSignals.developerTools) },
        { label: "Privacy Settings", value: formatNetworkFlag(snapshot.smartSignals.privacySettings), tone: toneForFlag(snapshot.smartSignals.privacySettings) },
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

function RiskDonut({
  showTrustedExample,
  snapshot,
}: {
  showTrustedExample: boolean;
  snapshot: FingerprintSnapshot;
}) {
  const score = showTrustedExample ? 4 : snapshot.scores.riskScore;
  const riskLabel = showTrustedExample ? "Low" : snapshot.scores.riskLabel;
  const usesFingerprintSmartSignals = Object.values(snapshot.smartSignals)
    .some((value) => value !== null);
  return (
    <div className="overview-panel__section risk-overview" data-risk={score >= 15 ? "high" : "safe"}>
      <div className="risk-overview__intro">
        <span>Risk profile</span>
        <h3>Trust & Entropy</h3>
        <p>{showTrustedExample
          ? "Trusted device example with no detected fraud-risk signals."
          : usesFingerprintSmartSignals
          ? "Fingerprint Smart Signals are combined into this suspect score."
          : "Browser-visible signals are combined into one local confidence score."}</p>
      </div>
      <div className="risk-overview__body">
        <div className="risk-donut">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="49" />
            <circle className="risk-donut__progress" cx="60" cy="60" r="49" strokeDasharray={`${score * 3.08} ${308 - score * 3.08}`} />
          </svg>
          <div><strong>{score}</strong><span>{riskLabel} Risk</span></div>
        </div>
        <dl>
          <div><dt>Uniqueness</dt><dd>{snapshot.scores.uniqueness}% <small>est.</small></dd></div>
          <div><dt>Consistency</dt><dd>{snapshot.scores.consistency}%</dd></div>
          <div><dt>Anonymity</dt><dd>{snapshot.scores.anonymityLabel}</dd></div>
          <div><dt>Signal Entropy</dt><dd>{snapshot.signals.canvasHash === "Unavailable" ? "Limited" : "High"}</dd></div>
        </dl>
      </div>
    </div>
  );
}

function OverviewPanel({
  showTrustedExample,
  snapshot,
}: {
  showTrustedExample: boolean;
  snapshot: FingerprintSnapshot;
}) {
  const score = showTrustedExample ? 4 : snapshot.scores.riskScore;
  return (
    <section
      aria-label="Fingerprint overview"
      className="overview-panel"
      data-risk={score >= 15 ? "high" : "safe"}
    >
      <div className="overview-panel__analysis">
        <RiskDonut showTrustedExample={showTrustedExample} snapshot={snapshot} />
      </div>
      <SuspectSignalTable showTrustedExample={showTrustedExample} snapshot={snapshot} />
    </section>
  );
}

function RawData({ onCopy, onDownload, snapshot }: { onCopy: () => void; onDownload: () => void; snapshot: FingerprintSnapshot }) {
  return (
    <section className="raw-data" id="raw-data">
      <div className="raw-data__header">
        <div><FileJson aria-hidden="true" /><span><strong>Raw fingerprint JSON</strong><small>{snapshot.identity.provider === "fingerprint-pro" ? "Includes normalized Fingerprint provider data" : "Generated locally in your browser"}</small></span></div>
        <div className="raw-data__actions">
          <button onClick={onCopy} type="button"><Copy aria-hidden="true" /> Copy JSON</button>
          <button onClick={onDownload} type="button"><Download aria-hidden="true" /> Download JSON</button>
        </div>
      </div>
      <pre>{JSON.stringify(snapshot, null, 2)}</pre>
    </section>
  );
}

function DetailDashboard({
  activeTab,
  onActiveTabChange,
  showTrustedExample,
  snapshot,
}: {
  activeTab: DetailTab;
  onActiveTabChange: (tab: DetailTab) => void;
  showTrustedExample: boolean;
  snapshot: FingerprintSnapshot | null;
}) {
  const [copied, setCopied] = useState(false);
  const cards = useMemo(() => snapshot ? buildCards(snapshot) : [], [snapshot]);
  const visibleCards = cards.filter((card) => card.key === activeTab);
  const selectedJson = useMemo(() => {
    if (!snapshot || activeTab === "Overview") return null;
    if (activeTab === "Browser") return { browser: snapshot.browser };
    if (activeTab === "Network") return { network: snapshot.network };
    if (activeTab === "Fingerprint") return {
      fingerprint: snapshot.signals,
      identity: snapshot.identity,
    };
    if (activeTab === "Privacy") return {
      privacy: snapshot.privacy,
      smartSignals: snapshot.smartSignals,
    };
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
        <div className="detail-dashboard__heading">
          <div>
            <h2>Detailed Browser Fingerprint</h2>
            <p>Network, browser, device and privacy signals from this session.</p>
          </div>
        </div>
      </header>

      <div className="detail-tabs" role="tablist" aria-label="Fingerprint categories">
        {detailTabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.label}
            className={activeTab === tab.label ? "is-active" : undefined}
            key={tab.label}
            onClick={() => onActiveTabChange(tab.label)}
            role="tab"
            type="button"
          >
            {tab.icon}<span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="detail-dashboard__content">
        {!snapshot ? (
          <div className="dashboard-loading">
            <span className="scan-loader"><Fingerprint aria-hidden="true" /></span>
            <strong>Collecting browser fingerprint</strong>
            <p>Reading canvas, WebGL, fonts, media, storage, network and privacy signals…</p>
          </div>
        ) : activeTab === "Raw Data" ? (
          <RawData onCopy={copyJson} onDownload={downloadJson} snapshot={snapshot} />
        ) : activeTab === "Overview" ? (
          <OverviewPanel showTrustedExample={showTrustedExample} snapshot={snapshot} />
        ) : (
          <div className="data-grid data-grid--single">
            {visibleCards.map((card) => (
              <DataCard
                actions={(
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
        )}
      </div>

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
      <div className="footer-bottom"><span>© 2026 Fingerprint Analyzer. Local diagnostic demonstration.</span><div><a href="#footer">Privacy Policy</a><a href="#footer">Terms of Service</a><a href="#footer">Security</a></div></div>
    </footer>
  );
}

export default function HomePage() {
  const { error, scan, snapshot, status } = useFingerprintScan();
  const [detailTab, setDetailTab] = useState<DetailTab>("Overview");
  const [showTrustedExample, setShowTrustedExample] = useState(false);
  const scanning = status === "collecting";

  const startScan = () => {
    setShowTrustedExample(false);
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
            <h1>Know every browser.<br />Stop <span>fraud</span> with confidence.</h1>
            <p>See the browser signals that make every visitor distinct. Analyze network, device, canvas, WebGL and privacy attributes in real time.</p>
            <div className="hero-actions">
              <button className="primary-button" disabled={scanning} onClick={startScan} type="button">{scanning ? "Analyzing…" : "Analyze My Browser"}<ArrowRight aria-hidden="true" /></button>
              <a className="secondary-button" href="#details">Explore Signals <Play aria-hidden="true" /></a>
            </div>
            <div className="hero-trust"><span><ShieldCheck /> Runs locally</span><span><LockKeyhole /> No fingerprint storage</span><span><Code2 /> Exportable JSON</span></div>
            {error ? <p className="scan-error">Some signals were blocked: {error}</p> : null}
          </div>
          <HeroConsole
            onCalculationClick={() => setDetailTab("Overview")}
            onTrustedExampleChange={setShowTrustedExample}
            scanning={scanning}
            showTrustedExample={showTrustedExample}
            snapshot={snapshot}
          />
        </section>
        <div className="page-container">
          <TrustBar />
          <DetailDashboard
            activeTab={detailTab}
            onActiveTabChange={setDetailTab}
            showTrustedExample={showTrustedExample}
            snapshot={snapshot}
          />
          <FinalCta onAnalyze={startScan} scanning={scanning} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
