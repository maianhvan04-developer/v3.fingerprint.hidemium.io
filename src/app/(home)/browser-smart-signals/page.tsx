"use client";

import { Globe2, Monitor, ShieldCheck } from "lucide-react";
import {
  Card,
  detectionTone,
  fallback,
  join,
  type SignalPanelsProps,
  type SignalRow,
} from "@/app/(home)/signal-panel-core/page";
import { useI18n } from "@/lib/i18n";

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

  return (
    <div className="console-signal-panel console-signal-panel--browser" data-scanning={scanning}>
      <Card icon={Globe2} rows={browserRows} title={t("common.browser")} />
      <Card icon={ShieldCheck} rows={privacyRows} title={t("signalPanels.privacy")} />
      <Card icon={Monitor} rows={deviceRows} title={t("signalPanels.device")} />
    </div>
  );
}

export default BrowserSmartSignals;
