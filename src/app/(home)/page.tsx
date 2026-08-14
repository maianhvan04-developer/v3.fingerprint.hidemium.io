"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Box,
  Braces,
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Fingerprint,
  Filter,
  FileCode2,
  LayoutDashboard,
  Lock,
  LockKeyhole,
  MapPin,
  Palette,
  Play,
  Radio,
  RefreshCw,
  ShieldCheck,
  Type,
  Wifi,
  Zap,
} from "lucide-react";
import { BrowserSmartSignals } from "@/components/home/BrowserSmartSignals";
import { FingerprintLiveDemo } from "@/components/home/FingerprintLiveDemo";
import { IdentificationSignals } from "@/components/home/IdentificationSignals";
import { SuspectSignalTable } from "@/components/home/SuspectSignalTable";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DataCard, type DataCardData as UiDataCardData } from "@/components/ui/DataCard";
import { JsonPreviewModal } from "@/components/ui/JsonPreviewModal";
import { useAnimatedScore } from "@/hooks/useAnimatedScore";
import { localizeStatus, useI18n, type Translate } from "@/lib/i18n";
import { useFingerprintScan } from "@/hooks/use-fingerprint-scan";
import type { FingerprintJsonValue, FingerprintRow, FingerprintSnapshot, ValueTone } from "@/types/fingerprint";

type DetailTab =
  | "Overview"
  | "IP Address"
  | "JavaScript"
  | "WebRTC Leak Test"
  | "Canvas Fingerprinting"
  | "WebGL Report"
  | "Font Fingerprinting"
  | "Geolocation API"
  | "Features Detection"
  | "TLS Client Test"
  | "Content Filters";
type BrowserLeakTab = Exclude<DetailTab, "Overview">;
type ConsoleMode = "identification" | "browser" | "live";
const consoleAddress = "https://fingerprint.hidemium.io/";

interface DetailCardData extends UiDataCardData {
  key: BrowserLeakTab;
}

const detailTabs: Array<{ icon: ReactNode; label: DetailTab }> = [
  { icon: <LayoutDashboard aria-hidden="true" />, label: "Overview" },
  { icon: <Radio aria-hidden="true" />, label: "IP Address" },
  { icon: <Braces aria-hidden="true" />, label: "JavaScript" },
  { icon: <Wifi aria-hidden="true" />, label: "WebRTC Leak Test" },
  { icon: <Palette aria-hidden="true" />, label: "Canvas Fingerprinting" },
  { icon: <Box aria-hidden="true" />, label: "WebGL Report" },
  { icon: <Type aria-hidden="true" />, label: "Font Fingerprinting" },
  { icon: <MapPin aria-hidden="true" />, label: "Geolocation API" },
  { icon: <FileCode2 aria-hidden="true" />, label: "Features Detection" },
  { icon: <Lock aria-hidden="true" />, label: "TLS Client Test" },
  { icon: <Filter aria-hidden="true" />, label: "Content Filters" },
];
const consoleModes: Array<{ icon: ReactNode; id: ConsoleMode; index: string }> = [
  { icon: <ShieldCheck aria-hidden="true" />, id: "live", index: "01" },
  { icon: <Fingerprint aria-hidden="true" />, id: "identification", index: "02" },
  { icon: <BrainCircuit aria-hidden="true" />, id: "browser", index: "03" },
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

function useScrollEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = new Set<HTMLElement>();
    let animationFrame = 0;

    const updateScrollVars = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));

      root.style.setProperty("--scroll-offset", `${Math.round(progress * 120)}px`);
    };

    const requestScrollUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateScrollVars);
    };

    const cleanupScrollVars = () => {
      window.cancelAnimationFrame(animationFrame);
      root.style.removeProperty("--scroll-offset");
    };

    root.classList.add("scroll-effects-ready");

    if (reduceMotion) {
      document
        .querySelectorAll<HTMLElement>("[data-scroll]")
        .forEach((element) => element.classList.add("is-visible"));
      return () => root.classList.remove("scroll-effects-ready");
    }

    updateScrollVars();
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);

    if (!("IntersectionObserver" in window)) {
      document
        .querySelectorAll<HTMLElement>("[data-scroll]")
        .forEach((element) => element.classList.add("is-visible"));

      return () => {
        window.removeEventListener("scroll", requestScrollUpdate);
        window.removeEventListener("resize", requestScrollUpdate);
        cleanupScrollVars();
        root.classList.remove("scroll-effects-ready");
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      },
    );

    const observeTargets = () => {
      document
        .querySelectorAll<HTMLElement>("[data-scroll]")
        .forEach((element, index) => {
          if (targets.has(element)) return;

          const delay = Number.parseInt(element.dataset.scrollDelay ?? `${index % 5}`, 10);
          element.style.setProperty("--scroll-delay", `${Number.isNaN(delay) ? 0 : delay * 70}ms`);
          targets.add(element);
          observer.observe(element);
        });
    };

    observeTargets();

    const mutationObserver = new MutationObserver(observeTargets);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
      window.removeEventListener("scroll", requestScrollUpdate);
      window.removeEventListener("resize", requestScrollUpdate);
      targets.forEach((element) => {
        element.classList.remove("is-visible");
        element.style.removeProperty("--scroll-delay");
      });
      cleanupScrollVars();
      root.classList.remove("scroll-effects-ready");
    };
  }, []);
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
  const [consoleReady, setConsoleReady] = useState(false);
  const [typedAddress, setTypedAddress] = useState("");
  const { t } = useI18n();

  useEffect(() => {
    let characterIndex = 0;
    const typingTimer = window.setInterval(() => {
      characterIndex += 1;
      setTypedAddress(consoleAddress.slice(0, characterIndex));

      if (characterIndex < consoleAddress.length) return;

      window.clearInterval(typingTimer);
      setConsoleReady(true);
    }, 48);

    return () => window.clearInterval(typingTimer);
  }, []);

  return (
    <div
      className="hero-console"
      id="browser-preview"
      aria-label={t("console.aria")}
      data-scroll="zoom"
      data-scroll-delay="1"
    >
      <div className="hero-console__titlebar">
        <span className="hero-console__controls" aria-hidden="true"><i /><i /><i /></span>
        <div
          aria-label={consoleAddress}
          className="hero-console__titlebar-label"
        >
          <LockKeyhole aria-hidden="true" />
          <span aria-hidden="true">{typedAddress}</span>
          {!consoleReady ? <i aria-hidden="true" className="hero-console__typing-caret" /> : null}
          <RefreshCw aria-hidden="true" />
        </div>
      </div>

      <div
        aria-hidden={!consoleReady}
        className="hero-console__content"
        data-ready={consoleReady || undefined}
      >
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
              {mode.icon}
              <small>{mode.index}</small>
              <span>{t(`console.modes.${mode.id}`)}</span>
            </button>
          ))}
        </div>

        <div className="hero-console__workspace">
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
    <section className="trust-bar" aria-label={t("trust.aria")} data-scroll="fade-up">
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

const browserLeakTabSections = {
  "IP Address": "ipAddress",
  JavaScript: "javaScript",
  "WebRTC Leak Test": "webRtc",
  "Canvas Fingerprinting": "canvas",
  "WebGL Report": "webGl",
  "Font Fingerprinting": "fonts",
  "Geolocation API": "geolocation",
  "Features Detection": "features",
  "TLS Client Test": "tls",
  "Content Filters": "contentFilters",
} satisfies Record<BrowserLeakTab, keyof FingerprintSnapshot["browserLeaks"]>;

function iconForTab(tab: DetailTab) {
  return detailTabs.find((item) => item.label === tab)?.icon ?? <Fingerprint aria-hidden="true" />;
}

const hiddenBrowserLeaksUiRows = new Set([
  "BrowserLeaks Feature Checklist",
  "BrowserLeaks Fields",
  "BrowserLeaks Sections",
]);

function isPlainObject(value: FingerprintJsonValue): value is Record<string, FingerprintJsonValue> {
  return value !== null && !Array.isArray(value) && typeof value === "object";
}

function formatJsonValue(label: string, value: FingerprintJsonValue, t: Translate): string {
  if (value === null) return t("common.unavailable");
  if (Array.isArray(value)) {
    if (value.length === 0) return t("common.none");
    const visibleItems = value.slice(0, 18).map((item) => formatJsonValue(label, item, t));
    const extraCount = value.length - visibleItems.length;
    return extraCount > 0
      ? `${visibleItems.join(", ")} +${extraCount}`
      : visibleItems.join(", ");
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    return keys.length ? `${keys.length} fields` : t("common.none");
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") {
    if (label === "Canvas Data URL" && value.length > 140) {
      return `${value.slice(0, 140)}… (${value.length} chars · full in JSON)`;
    }
    return localizeStatus(value, t);
  }
  return String(value);
}

function toneForBrowserLeakRow(label: string, value: FingerprintJsonValue): ValueTone {
  const key = label.toLowerCase();
  const riskyFlag = /vpn|proxy|tor|hosting|webdriver|headless|ad blocker|bot|tampering|virtual machine|ip blocklist|automation|rare device|developer tools/.test(key);
  if (typeof value === "boolean") {
    if (!riskyFlag) return "default";
    return value ? "warn" : "good";
  }
  if (Array.isArray(value)) {
    if (/address|candidate|extension|font|plugin|mime/.test(key)) {
      return value.length > 0 && /webrtc|candidate|address/.test(key) ? "warn" : "default";
    }
    return "default";
  }
  if (typeof value !== "string") return "default";
  const normalized = value.toLowerCase();
  if (/ip address|hash|visitor|canvas|webgl|renderer|vendor/.test(key) && value !== "Unavailable") return "accent";
  if (/not detected|no leak|not enabled|not set|default|unavailable|unsupported|false|^no$/.test(normalized)) {
    return riskyFlag ? "good" : "default";
  }
  if (/detected|possible|exposure|anonymous network|blocklist|active|true/.test(normalized)) return "warn";
  return "default";
}

function rowsFromBrowserLeakSection(
  section: FingerprintSnapshot["browserLeaks"][keyof FingerprintSnapshot["browserLeaks"]],
  t: Translate,
): FingerprintRow[] {
  const rowsFromEntry = (label: string, value: FingerprintJsonValue): FingerprintRow[] => {
    if (hiddenBrowserLeaksUiRows.has(label)) return [];

    if (isPlainObject(value)) {
      return Object.entries(value).flatMap(([childLabel, childValue]) => (
        rowsFromEntry(`${label} · ${childLabel}`, childValue)
      ));
    }

    return [{
      label,
      tone: toneForBrowserLeakRow(label, value),
      value: formatJsonValue(label, value, t),
    }];
  };

  return Object.entries(section).flatMap(([label, value]) => rowsFromEntry(label, value));
}

function buildCards(snapshot: FingerprintSnapshot, t: Translate): DetailCardData[] {
  const browserLeakTabs = detailTabs.filter((tab): tab is { icon: ReactNode; label: BrowserLeakTab } => tab.label !== "Overview");

  return browserLeakTabs.map((tab) => {
    const sectionKey = browserLeakTabSections[tab.label];
    return {
      icon: iconForTab(tab.label),
      key: tab.label,
      rows: rowsFromBrowserLeakSection(snapshot.browserLeaks[sectionKey], t),
      title: t(`details.tabs.${tab.label}`),
    };
  });
}

function circularPoint(angleDegrees: number) {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;

  return {
    x: 60 + 49 * Math.cos(angleRadians),
    y: 60 + 49 * Math.sin(angleRadians),
  };
}

function circularProgressPath(value: number) {
  const score = Math.min(100, Math.max(0, Math.round(value)));

  if (score <= 0) return "";

  const endAngle = Math.min(359.99, score * 3.6);
  const start = circularPoint(0);
  const end = circularPoint(endAngle);
  const largeArcFlag = endAngle > 180 ? 1 : 0;
  const format = (point: number) => Number(point.toFixed(3));

  return [
    `M ${format(start.x)} ${format(start.y)}`,
    `A 49 49 0 ${largeArcFlag} 1 ${format(end.x)} ${format(end.y)}`,
  ].join(" ");
}

function RiskDonut({
  scanning,
  showTrustedExample,
  snapshot,
}: {
  scanning: boolean;
  showTrustedExample: boolean;
  snapshot: FingerprintSnapshot;
}) {
  const { t } = useI18n();
  const score = showTrustedExample ? 4 : snapshot.scores.riskScore;
  const scoreReady = showTrustedExample || !scanning;
  const [scoreRef, animatedScore] = useAnimatedScore<HTMLDivElement>(score, { enabled: scoreReady });
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
        <div className="risk-donut" ref={scoreRef}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="risk-donut__track" cx="60" cy="60" r="49" />
            {animatedScore > 0 ? <path className="risk-donut__progress" d={circularProgressPath(animatedScore)} /> : null}
          </svg>
          <div><strong>{animatedScore}</strong><span>{riskLabel} {t("common.risk")}</span></div>
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
  scanning,
  showTrustedExample,
  snapshot,
}: {
  scanning: boolean;
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
      data-scroll="fade-up"
    >
      <div className="overview-panel__analysis">
        <RiskDonut scanning={scanning} showTrustedExample={showTrustedExample} snapshot={snapshot} />
      </div>
      <SuspectSignalTable showTrustedExample={showTrustedExample} snapshot={snapshot} />
    </section>
  );
}

function DetailDashboard({
  activeTab,
  onActiveTabChange,
  scanning,
  showTrustedExample,
  snapshot,
}: {
  activeTab: DetailTab;
  onActiveTabChange: (tab: DetailTab) => void;
  scanning: boolean;
  showTrustedExample: boolean;
  snapshot: FingerprintSnapshot | null;
}) {
  const [copied, setCopied] = useState(false);
  const [jsonPreviewOpen, setJsonPreviewOpen] = useState(false);
  const { t } = useI18n();
  const cards = useMemo(() => snapshot ? buildCards(snapshot, t) : [], [snapshot, t]);
  const visibleCards = cards.filter((card) => card.key === activeTab);
  const selectedJson = useMemo(() => {
    if (!snapshot) return null;
    if (activeTab === "Overview") {
      return {
        identity: snapshot.identity,
        scores: snapshot.scores,
        signals: snapshot.smartSignals,
        summary: {
          browser: `${snapshot.browser.name} ${snapshot.browser.version}`,
          ipAddress: snapshot.network.ipAddress,
          location: snapshot.network.city,
          sessionId: snapshot.sessionId,
        },
      };
    }
    return snapshot.browserLeaks[browserLeakTabSections[activeTab]];
  }, [activeTab, snapshot]);
  const selectedJsonString = useMemo(() => selectedJson ? JSON.stringify(selectedJson, null, 2) : "", [selectedJson]);

  useEffect(() => {
    if (!jsonPreviewOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setJsonPreviewOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [jsonPreviewOpen]);

  const copyJson = async () => {
    if (!selectedJson) return;
    await navigator.clipboard.writeText(JSON.stringify(selectedJson, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  };

  const openJsonPreview = () => {
    if (!selectedJson) return;
    setJsonPreviewOpen(true);
  };

  const downloadJson = () => {
    if (!selectedJsonString || !snapshot) return;
    const sectionName = activeTab.toLowerCase().replaceAll(" ", "-");
    const blob = new Blob([selectedJsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fingerprint-${sectionName}-${snapshot.sessionId.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="detail-dashboard" data-scroll="fade-up" id="details">
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
            onClick={() => {
              setJsonPreviewOpen(false);
              onActiveTabChange(tab.label);
            }}
            role="tab"
            title={t(`details.tabs.${tab.label}`)}
            type="button"
          >
            {tab.icon}<span>{t(`details.tabShort.${tab.label}`)}</span>
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
        ) : activeTab === "Overview" ? (
          <OverviewPanel scanning={scanning} showTrustedExample={showTrustedExample} snapshot={snapshot} />
        ) : (
          <div className="data-grid data-grid--single">
            {visibleCards.map((card) => (
              <DataCard
                actions={(
                  <>
                    <button onClick={copyJson} type="button"><Copy aria-hidden="true" /> {t("common.copyJson")}</button>
                    <button onClick={openJsonPreview} type="button"><Download aria-hidden="true" /> {t("common.downloadJson")}</button>
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
      <JsonPreviewModal
        closeLabel={t("common.close")}
        content={selectedJsonString}
        description={t("details.jsonPreviewDescription")}
        downloadLabel={t("common.downloadJson")}
        eyebrow={t("details.jsonPreviewEyebrow")}
        onClose={() => setJsonPreviewOpen(false)}
        onDownload={downloadJson}
        open={jsonPreviewOpen}
        title={t("details.jsonPreviewTitle", { section: t(`details.tabs.${activeTab}`) })}
      />
    </section>
  );
}

function FinalCta({ onAnalyze, scanning }: { onAnalyze: () => void; scanning: boolean }) {
  const { t } = useI18n();
  return (
    <section className="final-cta" data-scroll="zoom">
      <div className="final-cta__glow"><Fingerprint aria-hidden="true" /></div>
      <div>
        <span className="section-kicker">{t("cta.eyebrow")}</span>
        <h2>{t("cta.title")}</h2>
        <p>{t("cta.description")}</p>
        <div className="cta-trust"><span><ShieldCheck /> {t("cta.localProcessing")}</span><span><LockKeyhole /> {t("cta.noStorage")}</span><span><Zap /> {t("cta.liveSignals")}</span></div>
      </div>
      <div className="final-cta__actions">
        <button className="primary-button" disabled={scanning} onClick={onAnalyze} type="button">{scanning ? t("common.analyzing") : t("cta.analyze")}<ArrowRight /></button>
        <a className="secondary-button" href="https://hidemium.io/" rel="noreferrer" target="_blank">{t("cta.view")} <ExternalLink /></a>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { error, scan, snapshot, status } = useFingerprintScan();
  const { t } = useI18n();
  const [detailTab, setDetailTab] = useState<DetailTab>("Overview");
  const [showTrustedExample, setShowTrustedExample] = useState(false);
  const scanning = status === "collecting";

  useScrollEffects();

  const scrollToDetails = () => {
    const details = document.getElementById("details");
    details?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const startScan = (scrollTarget: "details" | "top" = "details") => {
    setShowTrustedExample(false);
    void scan();
    if (scrollTarget === "top") {
      document.getElementById("top")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.requestAnimationFrame(() => window.scrollTo({ behavior: "smooth", top: 0 }));
      return;
    }
    scrollToDetails();
    window.requestAnimationFrame(scrollToDetails);
    window.setTimeout(scrollToDetails, 120);
  };

  const startScanAndShowDetails = () => startScan("details");
  const startScanAndReturnTop = () => startScan("top");

  return (
    <div className="site-shell" id="top">
      <SiteHeader onAnalyze={startScanAndShowDetails} scanning={scanning} />
      <main>
        <section className="hero-section" id="overview">
          <div className="hero-network" aria-hidden="true" />
          <div className="hero-copy" data-scroll="fade-up" data-scroll-delay="0">
            <h1 data-scroll-child="1">{t("hero.titleLine1")}<br />{t("hero.titleLine2Before")} <span>{t("hero.titleAccent")}</span> {t("hero.titleLine2After")}</h1>
            <p data-scroll-child="2">{t("hero.description")}</p>
            <div className="hero-actions" data-scroll-child="3">
              <button className="primary-button" disabled={scanning} onClick={startScanAndShowDetails} type="button">{scanning ? t("common.analyzing") : t("hero.analyze")}<ArrowRight aria-hidden="true" /></button>
              <a className="secondary-button" href="#browser-preview">{t("hero.explore")} <Play aria-hidden="true" /></a>
            </div>
            <div className="hero-trust" data-scroll-child="4"><span><ShieldCheck /> {t("hero.runsLocally")}</span><span><LockKeyhole /> {t("hero.noStorage")}</span><span><Code2 /> {t("hero.exportable")}</span></div>
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
            scanning={scanning}
            showTrustedExample={showTrustedExample}
            snapshot={snapshot}
          />
          <FinalCta onAnalyze={startScanAndReturnTop} scanning={scanning} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
