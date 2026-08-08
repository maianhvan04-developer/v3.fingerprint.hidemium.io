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
import { BrandMark } from "@/components/icons";
import { FingerprintLiveDemo } from "@/components/fingerprint-demo/fingerprint-live-demo";
import {
  BrowserSmartSignals,
  IdentificationSignals,
} from "@/components/fingerprint-demo/signal-panels";
import { SuspectSignalTable } from "@/components/fingerprint-demo/suspect-signal-table";
import { SiteHeader } from "@/components/layout/site-header";
import { formatNetworkFlag } from "@/lib/fingerprint/collector";
import { localizeStatus, useI18n, type Translate } from "@/lib/i18n";
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
const consoleModes: Array<{ id: ConsoleMode; index: string }> = [
  { id: "live", index: "01" },
  { id: "identification", index: "02" },
  { id: "browser", index: "03" },
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
  const { t } = useI18n();

  return (
    <div className="hero-console" aria-label={t("console.aria")}>
      <div className="hero-console__titlebar">
        <span className="hero-console__controls" aria-hidden="true"><i /><i /><i /></span>
        <div className="hero-console__titlebar-label">
          http://fingerprint.hidemium.io/
        </div>
      </div>

      <div className="hero-console__workspace">
        <div className="hero-console__workspace-header">
          <span><i aria-hidden="true" />{scanning ? t("console.scanning") : t("console.live")}</span>
          <div className="hero-console__modes" aria-label={t("console.views")} role="tablist">
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
                <small>{mode.index}</small>
                <span>{t(`console.modes.${mode.id}`)}</span>
              </button>
            ))}
          </div>
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
        <span><i aria-hidden="true" />Fingerprint</span>
        <span>{snapshot?.browser.name ?? t("common.browser")} {snapshot?.browser.version ?? "--"} · {snapshot?.system.os ?? t("common.system")}</span>
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
  const { t } = useI18n();
  return (
    <section className="trust-bar" aria-label={t("trust.aria")}>
      <span>{t("trust.title")}</span>
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

function buildCards(snapshot: FingerprintSnapshot, t: Translate): DetailCardData[] {
  const providerLabel = snapshot.identity.provider === "fingerprint-pro"
    ? "Fingerprint Pro"
    : snapshot.identity.provider === "fingerprintjs"
      ? "FingerprintJS"
      : t("console.localDiagnostic");
  const confidence = snapshot.identity.confidence === null
    ? t("common.unavailable")
    : `${Math.round(snapshot.identity.confidence * 100)}%`;

  return [
    {
      icon: <Network aria-hidden="true" />,
      key: "Network",
      rows: [
        { label: t("fields.ipAddress"), value: snapshot.network.ipAddress, tone: "accent" },
        { label: snapshot.network.ipVersion || t("fields.ipVersion"), value: snapshot.network.ipVersion === "IPv6" ? snapshot.network.ipAddress : t("common.notDetected") },
        { label: t("fields.location"), value: snapshot.network.city },
        { label: t("fields.timezone"), value: snapshot.network.timezone },
        { label: t("fields.isp"), value: snapshot.network.isp },
        { label: t("fields.asn"), value: snapshot.network.asn },
        { label: t("fields.connectionType"), value: snapshot.network.connectionType },
        { label: t("fields.proxy"), value: localizeStatus(formatNetworkFlag(snapshot.network.proxy), t), tone: toneForFlag(snapshot.network.proxy) },
        { label: t("fields.vpn"), value: localizeStatus(formatNetworkFlag(snapshot.network.vpn), t), tone: toneForFlag(snapshot.network.vpn) },
        { label: t("fields.tor"), value: localizeStatus(formatNetworkFlag(snapshot.network.tor), t), tone: toneForFlag(snapshot.network.tor) },
        { label: t("fields.hosting"), value: localizeStatus(formatNetworkFlag(snapshot.network.hosting), t), tone: toneForFlag(snapshot.network.hosting) },
        { label: t("fields.webRtcLeak"), value: localizeStatus(snapshot.privacy.webRtc, t), tone: toneForDetection(snapshot.privacy.webRtc) },
      ],
      title: t("details.networkTitle"),
    },
    {
      icon: <Globe2 aria-hidden="true" />,
      key: "Browser",
      rows: [
        { label: t("fields.name"), value: snapshot.browser.name },
        { label: t("fields.version"), value: snapshot.browser.version },
        { label: t("fields.engine"), value: snapshot.browser.engine },
        { label: t("fields.userAgent"), value: snapshot.browser.userAgent },
        { label: t("fields.language"), value: snapshot.browser.languages.join(", ") || snapshot.browser.language },
        { label: t("fields.cookies"), value: snapshot.browser.cookies ? t("common.enabled") : t("common.disabled"), tone: snapshot.browser.cookies ? "good" : "warn" },
        { label: t("fields.localStorage"), value: snapshot.browser.localStorage ? t("common.enabled") : t("common.blocked"), tone: snapshot.browser.localStorage ? "good" : "warn" },
        { label: t("fields.sessionStorage"), value: snapshot.browser.sessionStorage ? t("common.enabled") : t("common.blocked"), tone: snapshot.browser.sessionStorage ? "good" : "warn" },
        { label: t("fields.indexedDb"), value: snapshot.browser.indexedDb ? t("common.enabled") : t("common.blocked"), tone: snapshot.browser.indexedDb ? "good" : "warn" },
        { label: t("fields.doNotTrack"), value: localizeStatus(snapshot.browser.doNotTrack, t) },
        { label: t("fields.referrer"), value: snapshot.browser.referrer },
        { label: t("fields.plugins"), value: String(snapshot.browser.plugins.length) },
      ],
      title: t("details.browserTitle"),
    },
    {
      icon: <Cpu aria-hidden="true" />,
      key: "System",
      rows: [
        { label: t("fields.os"), value: snapshot.system.os },
        { label: t("fields.osVersion"), value: snapshot.system.osVersion },
        { label: t("fields.platform"), value: snapshot.system.platform },
        { label: t("fields.architecture"), value: snapshot.system.architecture },
        { label: t("fields.deviceMemory"), value: snapshot.system.deviceMemory },
        { label: t("fields.cpuCores"), value: String(snapshot.system.hardwareConcurrency || t("common.protected")) },
        { label: t("fields.cpu"), value: snapshot.system.cpu },
        { label: t("fields.gpu"), value: snapshot.system.gpu },
        { label: t("fields.battery"), value: localizeStatus(snapshot.system.battery, t) },
        { label: t("fields.touch"), value: localizeStatus(snapshot.system.touchSupport, t) },
        { label: t("fields.hardwareConcurrency"), value: String(snapshot.system.hardwareConcurrency || t("common.protected")) },
        { label: t("fields.uptime"), value: snapshot.system.uptime },
      ],
      title: t("details.systemTitle"),
    },
    {
      icon: <Monitor aria-hidden="true" />,
      key: "Screen",
      rows: [
        { label: t("fields.resolution"), value: snapshot.screen.resolution },
        { label: t("fields.availableResolution"), value: snapshot.screen.availableResolution },
        { label: t("fields.colorDepth"), value: snapshot.screen.colorDepth },
        { label: t("fields.pixelDepth"), value: snapshot.screen.pixelDepth },
        { label: t("fields.devicePixelRatio"), value: snapshot.screen.devicePixelRatio },
        { label: t("fields.refreshRate"), value: snapshot.screen.refreshRate },
        { label: t("fields.orientation"), value: snapshot.screen.orientation },
        { label: t("fields.hdr"), value: localizeStatus(snapshot.screen.hdr, t) },
        { label: t("fields.viewport"), value: snapshot.screen.viewport },
        { label: t("fields.zoom"), value: snapshot.screen.zoomLevel },
      ],
      title: t("details.screenTitle"),
    },
    {
      icon: <Fingerprint aria-hidden="true" />,
      key: "Fingerprint",
      rows: [
        { label: t("fields.visitorId"), value: snapshot.identity.visitorId, tone: "accent" },
        { label: t("fields.identityProvider"), value: providerLabel },
        { label: t("fields.confidence"), value: confidence },
        { label: t("fields.requestId"), value: snapshot.identity.requestId ?? t("common.unavailable") },
        { label: t("fields.canvasFingerprint"), value: snapshot.signals.canvasHash, tone: "accent" },
        { label: t("fields.webGlVendor"), value: snapshot.signals.webGlVendor },
        { label: t("fields.webGlRenderer"), value: snapshot.signals.webGlRenderer },
        { label: t("fields.webGlVersion"), value: snapshot.signals.webGlVersion },
        { label: t("fields.audioFingerprint"), value: snapshot.signals.audioHash, tone: "accent" },
        { label: t("fields.fontsDetected"), value: String(snapshot.signals.fontCount) },
        { label: t("fields.pluginsCount"), value: String(snapshot.signals.pluginCount) },
        { label: t("fields.mimeTypes"), value: String(snapshot.signals.mimeTypeCount) },
        { label: t("fields.mediaDevices"), value: String(snapshot.signals.mediaDeviceCount) },
        { label: t("fields.speechSynthesis"), value: localizeStatus(snapshot.signals.speechSynthesis, t) },
        { label: t("fields.notificationPermission"), value: localizeStatus(snapshot.signals.notificationPermission, t) },
        { label: t("fields.compositeHash"), value: snapshot.compositeHash.slice(0, 24), tone: "accent" },
      ],
      title: t("details.fingerprintTitle"),
    },
    {
      icon: <LockKeyhole aria-hidden="true" />,
      key: "Privacy",
      rows: [
        { label: t("fields.bot"), value: localizeStatus(formatNetworkFlag(snapshot.smartSignals.bot), t), tone: toneForFlag(snapshot.smartSignals.bot) },
        { label: t("fields.incognito"), value: localizeStatus(formatNetworkFlag(snapshot.smartSignals.incognito), t), tone: toneForFlag(snapshot.smartSignals.incognito) },
        { label: t("fields.tampering"), value: localizeStatus(formatNetworkFlag(snapshot.smartSignals.tampering), t), tone: toneForFlag(snapshot.smartSignals.tampering) },
        { label: t("fields.virtualMachine"), value: localizeStatus(formatNetworkFlag(snapshot.smartSignals.virtualMachine), t), tone: toneForFlag(snapshot.smartSignals.virtualMachine) },
        { label: t("fields.developerTools"), value: localizeStatus(formatNetworkFlag(snapshot.smartSignals.developerTools), t), tone: toneForFlag(snapshot.smartSignals.developerTools) },
        { label: t("fields.privacySettings"), value: localizeStatus(formatNetworkFlag(snapshot.smartSignals.privacySettings), t), tone: toneForFlag(snapshot.smartSignals.privacySettings) },
        { label: t("fields.webRtc"), value: localizeStatus(snapshot.privacy.webRtc, t), tone: toneForDetection(snapshot.privacy.webRtc) },
        { label: t("fields.geolocation"), value: localizeStatus(snapshot.privacy.geolocationPermission, t) },
        { label: t("fields.camera"), value: localizeStatus(snapshot.privacy.cameraPermission, t) },
        { label: t("fields.microphone"), value: localizeStatus(snapshot.privacy.microphonePermission, t) },
        { label: t("fields.adBlocker"), value: localizeStatus(snapshot.privacy.adBlocker, t), tone: toneForDetection(snapshot.privacy.adBlocker, true) },
        { label: t("fields.automationFlags"), value: localizeStatus(snapshot.privacy.automationFlags, t), tone: toneForDetection(snapshot.privacy.automationFlags) },
        { label: t("fields.headless"), value: localizeStatus(snapshot.privacy.headless, t), tone: toneForDetection(snapshot.privacy.headless) },
        { label: t("fields.webDriver"), value: localizeStatus(snapshot.privacy.webDriver, t), tone: toneForDetection(snapshot.privacy.webDriver) },
        { label: t("fields.permissionsPolicy"), value: localizeStatus(snapshot.privacy.permissionsPolicy, t) },
        { label: t("fields.crossOriginIsolation"), value: localizeStatus(snapshot.privacy.crossOriginIsolation, t) },
      ],
      title: t("details.privacyTitle"),
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
  const { t } = useI18n();
  const score = showTrustedExample ? 4 : snapshot.scores.riskScore;
  const riskLabel = showTrustedExample ? t("common.low") : localizeStatus(snapshot.scores.riskLabel, t);
  const usesFingerprintSmartSignals = Object.values(snapshot.smartSignals)
    .some((value) => value !== null);
  return (
    <div className="overview-panel__section risk-overview" data-risk={score >= 15 ? "high" : "safe"}>
      <div className="risk-overview__intro">
        <span>{t("riskProfile.eyebrow")}</span>
        <h3>{t("riskProfile.title")}</h3>
        <p>{showTrustedExample
          ? t("riskProfile.trustedDescription")
          : usesFingerprintSmartSignals
          ? t("riskProfile.smartDescription")
          : t("riskProfile.localDescription")}</p>
      </div>
      <div className="risk-overview__body">
        <div className="risk-donut">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="49" />
            <circle className="risk-donut__progress" cx="60" cy="60" r="49" strokeDasharray={`${score * 3.08} ${308 - score * 3.08}`} />
          </svg>
          <div><strong>{score}</strong><span>{riskLabel} {t("common.risk")}</span></div>
        </div>
        <dl>
          <div><dt>{t("riskProfile.uniqueness")}</dt><dd>{snapshot.scores.uniqueness}% <small>{t("riskProfile.estimated")}</small></dd></div>
          <div><dt>{t("riskProfile.consistency")}</dt><dd>{snapshot.scores.consistency}%</dd></div>
          <div><dt>{t("riskProfile.anonymity")}</dt><dd>{localizeStatus(snapshot.scores.anonymityLabel, t)}</dd></div>
          <div><dt>{t("riskProfile.entropy")}</dt><dd>{snapshot.signals.canvasHash === "Unavailable" ? t("common.limited") : t("common.high")}</dd></div>
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
  const { t } = useI18n();
  const score = showTrustedExample ? 4 : snapshot.scores.riskScore;
  return (
    <section
      aria-label={t("riskProfile.aria")}
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
  const { t } = useI18n();
  return (
    <section className="raw-data" id="raw-data">
      <div className="raw-data__header">
        <div><FileJson aria-hidden="true" /><span><strong>{t("details.rawTitle")}</strong><small>{snapshot.identity.provider === "fingerprint-pro" ? t("details.rawPro") : t("details.rawLocal")}</small></span></div>
        <div className="raw-data__actions">
          <button onClick={onCopy} type="button"><Copy aria-hidden="true" /> {t("common.copyJson")}</button>
          <button onClick={onDownload} type="button"><Download aria-hidden="true" /> {t("common.downloadJson")}</button>
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
  const { t } = useI18n();
  const cards = useMemo(() => snapshot ? buildCards(snapshot, t) : [], [snapshot, t]);
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
            <h2>{t("details.title")}</h2>
            <p>{t("details.description")}</p>
          </div>
        </div>
      </header>

      <div className="detail-tabs" role="tablist" aria-label={t("details.categories")}>
        {detailTabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.label}
            className={activeTab === tab.label ? "is-active" : undefined}
            key={tab.label}
            onClick={() => onActiveTabChange(tab.label)}
            role="tab"
            type="button"
          >
            {tab.icon}<span>{t(`details.tabs.${tab.label}`)}</span>
          </button>
        ))}
      </div>

      <div className="detail-dashboard__content">
        {!snapshot ? (
          <div className="dashboard-loading">
            <span className="scan-loader"><Fingerprint aria-hidden="true" /></span>
            <strong>{t("details.loadingTitle")}</strong>
            <p>{t("details.loadingDescription")}</p>
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
                    <button onClick={copyJson} type="button"><Copy aria-hidden="true" /> {t("common.copyJson")}</button>
                    <button onClick={downloadJson} type="button"><Download aria-hidden="true" /> {t("common.downloadJson")}</button>
                  </>
                )}
                data={card}
                key={card.key}
              />
            ))}
          </div>
        )}
      </div>

      {copied ? <span className="copy-toast"><Check aria-hidden="true" /> {t("details.copied", { section: t(`details.tabs.${activeTab}`) })}</span> : null}
    </section>
  );
}

function FinalCta({ onAnalyze, scanning }: { onAnalyze: () => void; scanning: boolean }) {
  const { t } = useI18n();
  return (
    <section className="final-cta">
      <div className="final-cta__glow"><Fingerprint aria-hidden="true" /></div>
      <div>
        <span className="section-kicker">{t("cta.eyebrow")}</span>
        <h2>{t("cta.title")}</h2>
        <p>{t("cta.description")}</p>
        <div className="cta-trust"><span><ShieldCheck /> {t("cta.localProcessing")}</span><span><LockKeyhole /> {t("cta.noStorage")}</span><span><Zap /> {t("cta.liveSignals")}</span></div>
      </div>
      <div className="final-cta__actions">
        <button className="primary-button" disabled={scanning} onClick={onAnalyze} type="button">{scanning ? t("common.analyzing") : t("cta.analyze")}<ArrowRight /></button>
        <a className="secondary-button" href="https://amiunique.org/fr/fingerprint" rel="noreferrer" target="_blank">{t("cta.view")} <ExternalLink /></a>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useI18n();
  const columns = [
    { heading: t("footer.product"), links: ["overview", "features", "pricing", "integrations", "status"] },
    { heading: t("footer.solutions"), links: ["fraudPrevention", "accountTakeover", "paymentProtection", "botDetection", "riskManagement"] },
    { heading: t("footer.developers"), links: ["apiDocumentation", "sdks", "codeSamples", "changelog"] },
    { heading: t("footer.company"), links: ["about", "research", "privacy", "contact"] },
  ];
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-brand">
        <a className="brand-lockup" href="#top"><span className="brand-mark"><BrandMark /></span><span>Fingerprint Analyzer</span></a>
        <p>{t("footer.description")}</p>
        <a className="source-link" href="https://amiunique.org/faq" rel="noreferrer" target="_blank">{t("footer.methodology")} <ExternalLink /></a>
      </div>
      <div className="footer-links">
        {columns.map((column) => <div key={column.heading}><strong>{column.heading}</strong>{column.links.map((link) => <a href="#details" key={link}>{t(`footer.${link}`)}</a>)}</div>)}
      </div>
      <div className="footer-newsletter">
        <strong>{t("footer.stayUpdated")}</strong>
        <p>{t("footer.newsletterDescription")}</p>
        <form onSubmit={(event) => event.preventDefault()}><input aria-label={t("footer.email")} placeholder={t("footer.emailPlaceholder")} type="email" /><button aria-label={t("footer.subscribe")} type="submit"><ArrowRight /></button></form>
      </div>
      <div className="footer-bottom"><span>{t("footer.copyright")}</span><div><a href="#footer">{t("footer.privacyPolicy")}</a><a href="#footer">{t("footer.terms")}</a><a href="#footer">{t("footer.security")}</a></div></div>
    </footer>
  );
}

export default function HomePage() {
  const { error, scan, snapshot, status } = useFingerprintScan();
  const { t } = useI18n();
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
            <h1>{t("hero.titleLine1")}<br />{t("hero.titleLine2Before")} <span>{t("hero.titleAccent")}</span> {t("hero.titleLine2After")}</h1>
            <p>{t("hero.description")}</p>
            <div className="hero-actions">
              <button className="primary-button" disabled={scanning} onClick={startScan} type="button">{scanning ? t("common.analyzing") : t("hero.analyze")}<ArrowRight aria-hidden="true" /></button>
              <a className="secondary-button" href="#details">{t("hero.explore")} <Play aria-hidden="true" /></a>
            </div>
            <div className="hero-trust"><span><ShieldCheck /> {t("hero.runsLocally")}</span><span><LockKeyhole /> {t("hero.noStorage")}</span><span><Code2 /> {t("hero.exportable")}</span></div>
            {error ? <p className="scan-error">{t("hero.error", { error })}</p> : null}
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
