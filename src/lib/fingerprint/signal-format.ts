import { localizeStatus, type Translate } from "@/lib/i18n";
import type { ConsoleSignalRowData } from "@/components/ui/ConsoleSignalCard";
import type { FingerprintSnapshot, ValueTone } from "@/types/fingerprint";

export interface SignalPanelsProps {
  scanning: boolean;
  snapshot: FingerprintSnapshot | null;
}

export type SignalRow = ConsoleSignalRowData;

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
