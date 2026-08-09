"use client";

import type { ComponentType, SVGProps } from "react";
import { localizeStatus, type Translate } from "@/lib/i18n";
import type { FingerprintSnapshot, ValueTone } from "@/types/fingerprint";

export interface SignalPanelsProps {
  scanning: boolean;
  snapshot: FingerprintSnapshot | null;
}

export interface SignalRow {
  fullValue?: string;
  label: string;
  tone?: ValueTone;
  value: string;
}

type SignalIcon = ComponentType<SVGProps<SVGSVGElement>>;

export function fallback(value: string | undefined, scanning: boolean, t: Translate, pending?: string) {
  return value ? localizeStatus(value, t) : scanning ? (pending ?? t("common.scanning")) : t("common.unavailable");
}

export function join(values: Array<string | undefined>, scanning: boolean, t: Translate) {
  return fallback(values.filter(Boolean).join(", "), scanning, t);
}

export function detectionTone(value?: string): ValueTone {
  if (!value) return "default";
  if (/not detected|disabled|none|no leak|false/i.test(value)) return "good";
  return /detected|enabled|possible|true/i.test(value) ? "warn" : "default";
}

export function flag(value: boolean | null | undefined, scanning: boolean, t: Translate): SignalRow["value"] {
  if (value === true) return t("common.detected");
  if (value === false) return t("common.notDetected");
  return scanning ? t("common.checking") : t("common.unknown");
}

export function flagTone(value: boolean | null | undefined): ValueTone {
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

export function Card({ icon: Icon, rows, title }: { icon: SignalIcon; rows: SignalRow[]; title: string }) {
  return (
    <article className="console-signal-card">
      <h3 className="console-signal-card__title"><Icon aria-hidden="true" />{title}</h3>
      <div className="console-signal-card__rows">{rows.map((row) => <Row key={row.label} {...row} />)}</div>
    </article>
  );
}

export default function SignalPanelCorePage() {
  return null;
}
