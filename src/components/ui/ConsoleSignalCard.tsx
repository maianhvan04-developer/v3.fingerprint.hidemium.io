import type { ComponentType, SVGProps } from "react";
import type { ValueTone } from "@/types/fingerprint";

export interface ConsoleSignalRowData {
  fullValue?: string;
  label: string;
  tone?: ValueTone;
  value: string;
}

type ConsoleSignalIcon = ComponentType<SVGProps<SVGSVGElement>>;

function ConsoleSignalRow({ fullValue, label, tone = "default", value }: ConsoleSignalRowData) {
  return (
    <div className="console-signal-row">
      <span className="console-signal-row__label">{label}</span>
      <span className={`console-signal-row__value console-signal-row__value--${tone}`} title={fullValue ?? value}>
        {value}
      </span>
    </div>
  );
}

export function ConsoleSignalCard({
  icon: Icon,
  rows,
  title,
}: {
  icon: ConsoleSignalIcon;
  rows: ConsoleSignalRowData[];
  title: string;
}) {
  return (
    <article className="console-signal-card">
      <h3 className="console-signal-card__title"><Icon aria-hidden="true" />{title}</h3>
      <div className="console-signal-card__rows">
        {rows.map((row) => <ConsoleSignalRow key={row.label} {...row} />)}
      </div>
    </article>
  );
}
