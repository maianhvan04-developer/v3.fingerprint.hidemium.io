"use client";

import { Fingerprint, ScanSearch } from "lucide-react";
import { ConsoleSignalCard } from "@/components/ui/ConsoleSignalCard";
import {
  detectionTone,
  fallback,
  flag,
  flagTone,
  join,
  type SignalPanelsProps,
  type SignalRow,
} from "@/lib/fingerprint/signal-format";
import { useI18n } from "@/lib/i18n";

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

  return (
    <div className="console-signal-panel console-signal-panel--identification" data-scanning={scanning}>
      <ConsoleSignalCard icon={ScanSearch} rows={identityRows} title={t("signalPanels.identityOverview")} />
      <ConsoleSignalCard icon={Fingerprint} rows={recognitionRows} title={t("signalPanels.recognitionProfile")} />
    </div>
  );
}

export default IdentificationSignals;
