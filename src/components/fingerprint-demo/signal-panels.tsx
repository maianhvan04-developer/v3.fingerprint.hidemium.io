"use client";

import type { ComponentType, SVGProps } from "react";
import { Fingerprint, Globe2, Monitor, ScanSearch, ShieldCheck } from "lucide-react";
import { localizeStatus, useI18n, type Translate } from "@/lib/i18n";
import type { FingerprintSnapshot, ValueTone } from "@/types/fingerprint";

interface SignalPanelsProps {
  scanning: boolean;
  snapshot: FingerprintSnapshot | null;
}

interface SignalRow {
  fullValue?: string;
  label: string;
  tone?: ValueTone;
  value: string;
}

type SignalIcon = ComponentType<SVGProps<SVGSVGElement>>;

function fallback(value: string | undefined, scanning: boolean, t: Translate, pending?: string) {
  return value ? localizeStatus(value, t) : scanning ? (pending ?? t("common.scanning")) : t("common.unavailable");
}

function join(values: Array<string | undefined>, scanning: boolean, t: Translate) {
  return fallback(values.filter(Boolean).join(", "), scanning, t);
}

function detectionTone(value?: string): ValueTone {
  if (!value) return "default";
  if (/not detected|disabled|none|no leak|false/i.test(value)) return "good";
  return /detected|enabled|possible|true/i.test(value) ? "warn" : "default";
}

function flag(value: boolean | null | undefined, scanning: boolean, t: Translate): SignalRow["value"] {
  if (value === true) return t("common.detected");
  if (value === false) return t("common.notDetected");
  return scanning ? t("common.checking") : t("common.unknown");
}

function flagTone(value: boolean | null | undefined): ValueTone {
  return value === true ? "warn" : value === false ? "good" : "default";
}

function Row({ fullValue, label, tone = "default", value }: SignalRow) {
  return (
    <div className="console-signal-row">
      <span className="console-signal-row__label">{label}</span>
      <span className={`console-signal-row__value console-signal-row__value--${tone}`} title={fullValue ?? value}>
        {value}
      </span>
    </div>
  );
}

function Card({ icon: Icon, rows, title }: { icon: SignalIcon; rows: SignalRow[]; title: string }) {
  return (
    <article className="console-signal-card">
      <h3 className="console-signal-card__title"><Icon aria-hidden="true" />{title}</h3>
      <div className="console-signal-card__rows">{rows.map((row) => <Row key={row.label} {...row} />)}</div>
    </article>
  );
}

export function IdentificationSignals({ snapshot, scanning }: SignalPanelsProps) {
  const { t } = useI18n();
  const pending = scanning ? t("common.scanning") : t("common.unavailable");
  const visitorId = snapshot?.identity.visitorId || pending;
  const visitorIdDisplay = visitorId.length > 16 ? `${visitorId.slice(0, 16)}…` : visitorId;
  const webRtcLeaked = Boolean(snapshot?.network.webRtcAddresses.length) || detectionTone(snapshot?.privacy.webRtc) === "warn";
  const identityRows: SignalRow[] = [
    { label: t("fields.ipAddress"), value: fallback(snapshot?.network.ipAddress, scanning, t) },
    { label: t("fields.location"), value: join([snapshot?.network.city, snapshot?.network.country], scanning, t) },
    { label: t("fields.isp"), value: fallback(snapshot?.network.isp, scanning, t) },
    { label: t("fields.timezone"), value: fallback(snapshot?.network.timezone, scanning, t) },
    { label: t("fields.vpn"), value: flag(snapshot?.network.vpn, scanning, t), tone: flagTone(snapshot?.network.vpn) },
    { label: t("fields.webRtc"), value: fallback(snapshot?.privacy.webRtc, scanning, t, t("common.checking")), tone: webRtcLeaked ? "warn" : snapshot ? "good" : "default" },
  ];
  const recognitionRows: SignalRow[] = [
    { fullValue: visitorId, label: t("fields.visitorId"), tone: "accent", value: visitorIdDisplay },
    { label: t("fields.uniqueness"), tone: "accent", value: snapshot ? `${snapshot.scores.uniqueness}%` : pending },
    { label: t("fields.consistency"), tone: "accent", value: snapshot ? `${snapshot.scores.consistency}%` : pending },
    { label: t("fields.riskScore"), tone: snapshot ? (snapshot.scores.riskScore >= 15 ? "warn" : "good") : "default", value: snapshot ? String(snapshot.scores.riskScore) : pending },
    { label: t("fields.browser"), value: join([snapshot?.browser.name, snapshot?.browser.version], scanning, t) },
    { label: t("fields.operatingSystem"), value: join([snapshot?.system.os, snapshot?.system.osVersion], scanning, t) },
  ];

  return <div className="console-signal-panel console-signal-panel--identification" data-scanning={scanning}><Card icon={ScanSearch} rows={identityRows} title={t("signalPanels.identityOverview")} /><Card icon={Fingerprint} rows={recognitionRows} title={t("signalPanels.recognitionProfile")} /></div>;
}

export function BrowserSmartSignals({ snapshot, scanning }: SignalPanelsProps) {
  const { t } = useI18n();
  const browserRows: SignalRow[] = [
    { label: t("fields.browserVersion"), value: join([snapshot?.browser.name, snapshot?.browser.version], scanning, t) },
    { label: t("fields.engine"), value: fallback(snapshot?.browser.engine, scanning, t) },
    { label: t("fields.language"), value: fallback(snapshot?.browser.languages.join(", ") || snapshot?.browser.language, scanning, t) },
    { label: t("fields.cookies"), tone: snapshot ? (snapshot.browser.cookies ? "good" : "warn") : "default", value: snapshot ? (snapshot.browser.cookies ? t("common.enabled") : t("common.disabled")) : t("common.checking") },
    { label: t("fields.doNotTrack"), value: fallback(snapshot?.browser.doNotTrack, scanning, t, t("common.checking")) },
    { label: t("fields.userAgent"), value: fallback(snapshot?.browser.userAgent, scanning, t) },
  ];
  const privacyRows: SignalRow[] = [
    { label: t("fields.headless"), tone: detectionTone(snapshot?.privacy.headless), value: fallback(snapshot?.privacy.headless, scanning, t, t("common.checking")) },
    { label: t("fields.webDriver"), tone: detectionTone(snapshot?.privacy.webDriver), value: fallback(snapshot?.privacy.webDriver, scanning, t, t("common.checking")) },
    { label: t("fields.adBlocker"), tone: detectionTone(snapshot?.privacy.adBlocker), value: fallback(snapshot?.privacy.adBlocker, scanning, t, t("common.checking")) },
    { label: t("fields.automation"), tone: detectionTone(snapshot?.privacy.automationFlags), value: fallback(snapshot?.privacy.automationFlags, scanning, t, t("common.checking")) },
    { label: t("fields.webRtc"), tone: snapshot?.network.webRtcAddresses.length || detectionTone(snapshot?.privacy.webRtc) === "warn" ? "warn" : snapshot ? "good" : "default", value: fallback(snapshot?.privacy.webRtc, scanning, t, t("common.checking")) },
    { label: t("fields.geolocation"), value: fallback(snapshot?.privacy.geolocationPermission, scanning, t, t("common.checking")) },
  ];
  const deviceRows: SignalRow[] = [
    { label: t("fields.operatingSystem"), value: join([snapshot?.system.os, snapshot?.system.osVersion], scanning, t) },
    { label: t("fields.architecture"), value: fallback(snapshot?.system.architecture, scanning, t) },
    { label: t("fields.cpu"), value: fallback(snapshot?.system.cpu, scanning, t) },
    { label: t("fields.memory"), value: fallback(snapshot?.system.deviceMemory, scanning, t) },
    { label: t("fields.gpu"), value: fallback(snapshot?.system.gpu, scanning, t) },
    { label: t("fields.screen"), value: fallback(snapshot?.screen.resolution, scanning, t) },
  ];

  return <div className="console-signal-panel console-signal-panel--browser" data-scanning={scanning}><Card icon={Globe2} rows={browserRows} title={t("common.browser")} /><Card icon={ShieldCheck} rows={privacyRows} title={t("signalPanels.privacy")} /><Card icon={Monitor} rows={deviceRows} title={t("signalPanels.device")} /></div>;
}
