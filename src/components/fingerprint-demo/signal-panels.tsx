import type { ComponentType, SVGProps } from "react";
import { Fingerprint, Globe2, Monitor, ScanSearch, ShieldCheck } from "lucide-react";
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

function fallback(value: string | undefined, scanning: boolean, pending = "Scanning…") {
  return value || (scanning ? pending : "Unavailable");
}

function join(values: Array<string | undefined>, scanning: boolean) {
  return fallback(values.filter(Boolean).join(", "), scanning);
}

function detectionTone(value?: string): ValueTone {
  if (!value) return "default";
  if (/not detected|disabled|none|no leak|false/i.test(value)) return "good";
  return /detected|enabled|possible|true/i.test(value) ? "warn" : "default";
}

function flag(value: boolean | null | undefined, scanning: boolean): SignalRow["value"] {
  if (value === true) return "Detected";
  if (value === false) return "Not detected";
  return scanning ? "Checking…" : "Unknown";
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
  const pending = scanning ? "Scanning…" : "Unavailable";
  const visitorId = snapshot?.identity.visitorId || pending;
  const visitorIdDisplay = visitorId.length > 16 ? `${visitorId.slice(0, 16)}…` : visitorId;
  const webRtcLeaked = Boolean(snapshot?.network.webRtcAddresses.length) || detectionTone(snapshot?.privacy.webRtc) === "warn";
  const identityRows: SignalRow[] = [
    { label: "IP address", value: fallback(snapshot?.network.ipAddress, scanning) },
    { label: "Location", value: join([snapshot?.network.city, snapshot?.network.country], scanning) },
    { label: "ISP", value: fallback(snapshot?.network.isp, scanning) },
    { label: "Timezone", value: fallback(snapshot?.network.timezone, scanning) },
    { label: "VPN", value: flag(snapshot?.network.vpn, scanning), tone: flagTone(snapshot?.network.vpn) },
    { label: "WebRTC", value: fallback(snapshot?.privacy.webRtc, scanning, "Checking…"), tone: webRtcLeaked ? "warn" : snapshot ? "good" : "default" },
  ];
  const recognitionRows: SignalRow[] = [
    { fullValue: visitorId, label: "Visitor ID", tone: "accent", value: visitorIdDisplay },
    { label: "Uniqueness", tone: "accent", value: snapshot ? `${snapshot.scores.uniqueness}%` : pending },
    { label: "Consistency", tone: "accent", value: snapshot ? `${snapshot.scores.consistency}%` : pending },
    { label: "Risk score", tone: snapshot ? (snapshot.scores.riskScore >= 15 ? "warn" : "good") : "default", value: snapshot ? `${snapshot.scores.riskScore}/100` : pending },
    { label: "Browser", value: join([snapshot?.browser.name, snapshot?.browser.version], scanning) },
    { label: "Operating system", value: join([snapshot?.system.os, snapshot?.system.osVersion], scanning) },
  ];

  return <div className="console-signal-panel console-signal-panel--identification" data-scanning={scanning}><Card icon={ScanSearch} rows={identityRows} title="Identity overview" /><Card icon={Fingerprint} rows={recognitionRows} title="Recognition profile" /></div>;
}

export function BrowserSmartSignals({ snapshot, scanning }: SignalPanelsProps) {
  const browserRows: SignalRow[] = [
    { label: "Browser/version", value: join([snapshot?.browser.name, snapshot?.browser.version], scanning) },
    { label: "Engine", value: fallback(snapshot?.browser.engine, scanning) },
    { label: "Language", value: fallback(snapshot?.browser.languages.join(", ") || snapshot?.browser.language, scanning) },
    { label: "Cookies", tone: snapshot ? (snapshot.browser.cookies ? "good" : "warn") : "default", value: snapshot ? (snapshot.browser.cookies ? "Enabled" : "Disabled") : "Checking…" },
    { label: "Do Not Track", value: fallback(snapshot?.browser.doNotTrack, scanning, "Checking…") },
    { label: "User Agent", value: fallback(snapshot?.browser.userAgent, scanning) },
  ];
  const privacyRows: SignalRow[] = [
    { label: "Headless", tone: detectionTone(snapshot?.privacy.headless), value: fallback(snapshot?.privacy.headless, scanning, "Checking…") },
    { label: "WebDriver", tone: detectionTone(snapshot?.privacy.webDriver), value: fallback(snapshot?.privacy.webDriver, scanning, "Checking…") },
    { label: "Ad blocker", tone: detectionTone(snapshot?.privacy.adBlocker), value: fallback(snapshot?.privacy.adBlocker, scanning, "Checking…") },
    { label: "Automation", tone: detectionTone(snapshot?.privacy.automationFlags), value: fallback(snapshot?.privacy.automationFlags, scanning, "Checking…") },
    { label: "WebRTC", tone: snapshot?.network.webRtcAddresses.length || detectionTone(snapshot?.privacy.webRtc) === "warn" ? "warn" : snapshot ? "good" : "default", value: fallback(snapshot?.privacy.webRtc, scanning, "Checking…") },
    { label: "Geolocation", value: fallback(snapshot?.privacy.geolocationPermission, scanning, "Checking…") },
  ];
  const deviceRows: SignalRow[] = [
    { label: "Operating system", value: join([snapshot?.system.os, snapshot?.system.osVersion], scanning) },
    { label: "Architecture", value: fallback(snapshot?.system.architecture, scanning) },
    { label: "CPU", value: fallback(snapshot?.system.cpu, scanning) },
    { label: "Memory", value: fallback(snapshot?.system.deviceMemory, scanning) },
    { label: "GPU", value: fallback(snapshot?.system.gpu, scanning) },
    { label: "Screen", value: fallback(snapshot?.screen.resolution, scanning) },
  ];

  return <div className="console-signal-panel console-signal-panel--browser" data-scanning={scanning}><Card icon={Globe2} rows={browserRows} title="Browser" /><Card icon={ShieldCheck} rows={privacyRows} title="Privacy" /><Card icon={Monitor} rows={deviceRows} title="Device" /></div>;
}
