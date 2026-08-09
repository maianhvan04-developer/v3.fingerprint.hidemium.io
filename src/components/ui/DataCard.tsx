import type { ReactNode } from "react";

export interface DataCardRow {
  label: string;
  tone?: string;
  value: string;
}

export interface DataCardData {
  icon: ReactNode;
  rows: DataCardRow[];
  title: string;
}

export function DataCard({ actions, data }: { actions?: ReactNode; data: DataCardData }) {
  return (
    <article className="data-card" data-scroll="fade-up">
      <div className="data-card__header">
        <h3>{data.icon}{data.title}</h3>
        {actions ? <div className="data-card__actions">{actions}</div> : null}
      </div>
      <dl>
        {data.rows.map((row) => {
          const valueClassName = [
            row.tone ? `value-${row.tone}` : "",
            row.value.includes("\n") ? "value-multiline" : "",
          ].filter(Boolean).join(" ") || undefined;

          return (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd className={valueClassName}>{row.value}</dd>
            </div>
          );
        })}
      </dl>
    </article>
  );
}
