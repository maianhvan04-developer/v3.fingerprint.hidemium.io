import type { DiagnosticCard, Translation } from "@/types/fingerprint";

interface DiagnosticsGridProps {
  cards: DiagnosticCard[];
  onToggleCard: (name: string) => void;
  openCards: string[];
  text: Translation;
}

export function DiagnosticsGrid({ cards, onToggleCard, openCards, text }: DiagnosticsGridProps) {
  return (
    <section className="diagnostics" id="diagnostics">
      <div className="eyebrow">📋 Detailed Summary</div>
      <h2>{text.diagnostics}</h2>
      <p className="section-subtitle">{text.diagnosticsSub}</p>
      <div className="diagnostic-grid">
        {cards.map((card) => {
          const isOpen = openCards.includes(card.name);
          const statusClass = card.status === "ok" ? "ok" : card.status === "error" ? "has-errors" : "has-issues";
          return (
            <article className={`diagnostic-card ${statusClass}`} key={card.name}>
              <div className="code-icon" aria-hidden="true">&lt;/&gt;</div>
              <h4>{card.name}</h4>
              <p className="card-summary">{card.status === "ok" ? "✓ " : "● "}{card.summary}</p>
              {isOpen ? <p className="card-detail">{card.detail}</p> : null}
              {card.status === "ok" ? (
                <span className="verified-label">✓ Verified</span>
              ) : (
                <button aria-expanded={isOpen} className="card-button" onClick={() => onToggleCard(card.name)} type="button">
                  {isOpen ? "Hide troubles" : "View troubles"}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
