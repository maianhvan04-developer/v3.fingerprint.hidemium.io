import {
  Activity,
  Bot,
  CircleAlert,
  Cpu,
  Database,
  Image as ImageIcon,
  MonitorCog,
  Network,
  Smartphone,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { DiagnosticCard, Translation } from "@/types/fingerprint";

interface DiagnosticsGridProps {
  cards: DiagnosticCard[];
  text: Translation;
}

const diagnosticMeta: Record<string, { category: string; icon: LucideIcon }> = {
  audio: { category: "Media", icon: Activity },
  automation: { category: "Browser", icon: Bot },
  canvas: { category: "Canvas", icon: ImageIcon },
  cpu: { category: "Hardware", icon: Cpu },
  device: { category: "System", icon: Smartphone },
  font: { category: "Fonts", icon: Type },
  gpu: { category: "Hardware", icon: MonitorCog },
  network: { category: "Network", icon: Network },
  other: { category: "Storage / Privacy", icon: Database },
};

const statusLabels = {
  error: "Error",
  ok: "Verified",
  warning: "Warning",
} as const;

export function DiagnosticsGrid({ cards, text }: DiagnosticsGridProps) {
  return (
    <section className="diag-section" id="diagnostics" aria-labelledby="diagnostics-title">
      <header className="diag-header">
        <div>
          <span className="diag-kicker">Environment intelligence</span>
          <h2 id="diagnostics-title">{text.diagnostics}</h2>
          <p>{text.diagnosticsSub}</p>
        </div>
      </header>

      <div className="diag-grid">
        {cards.map((card) => {
          const meta = diagnosticMeta[card.name] || { category: "System", icon: MonitorCog };
          const Icon = meta.icon;
          return (
            <article className="diag-card" data-status={card.status} key={card.name}>
              <div className="diag-cardTop">
                <span className="diag-cardIcon"><Icon aria-hidden="true" /></span>
                <div>
                  <span>{meta.category}</span>
                  <h3>{card.name}</h3>
                </div>
                <span className="diag-statusBadge">{statusLabels[card.status]}</span>
              </div>
              <strong className="diag-summary">
                {card.status !== "ok" && <CircleAlert aria-hidden="true" />}
                <span>{card.summary}</span>
              </strong>
              <div
                className="diag-detail"
                role={card.status === "error" ? "alert" : undefined}
              >
                {card.status !== "ok" && (
                  <strong className="diag-detailLabel">
                    <CircleAlert aria-hidden="true" />
                    {card.status === "error" ? "Detected issue" : "Needs review"}
                  </strong>
                )}
                <div className="diag-detailLines">
                  {card.detail.split("\n").map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
