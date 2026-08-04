import { AlertTriangle, Check, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditCounts, AuditFilter, AuditItem, AuditStatus } from "@/types/fingerprint";

const filters: Array<[AuditFilter, string]> = [
  ["all", "All checks"],
  ["fail", "Needs review"],
  ["fatal", "Fatal only"],
  ["skip", "Not evaluable"],
];

const warningSeverityIds = new Set(["C-015", "C-031", "C-041"]);

const statusMeta: Record<AuditStatus, { icon: typeof Check; label: string }> = {
  fatal: { icon: X, label: "Fail" },
  pass: { icon: Check, label: "Pass" },
  skip: { icon: Minus, label: "Skip" },
  warn: { icon: AlertTriangle, label: "Warning" },
};

interface CdiValidatorProps {
  auditCounts: AuditCounts;
  auditVerdict: string;
  audits: AuditItem[];
  browserReady: boolean;
  filter: AuditFilter;
  onFilterChange: (filter: AuditFilter) => void;
  visibleAudits: AuditItem[];
}

export function CdiValidator({
  auditCounts,
  auditVerdict,
  audits,
  browserReady,
  filter,
  onFilterChange,
  visibleAudits,
}: CdiValidatorProps) {
  const verdictTone = !browserReady
    ? "running"
    : auditCounts.fatal ? "fail" : auditCounts.warn ? "review" : "pass";

  return (
    <section className="cdi-section" id="cdi-validator" aria-labelledby="cdi-title">
      <header className="cdi-header">
        <div>
          <span className="cdi-kicker">CDI v2.0 · Coherence contract</span>
          <h2 id="cdi-title">Coherent Device Identity Validator</h2>
          <p>
            Cross-checks the browser profile against C-001…C-052. Server-only rules remain SKIP
            and never count as successful checks.
          </p>
        </div>
      </header>

      <div className="cdi-overview">
        <div className="cdi-verdict" data-verdict={verdictTone}>
          <span>Coherence result</span>
          <strong>{auditVerdict}</strong>
          <small>{browserReady ? `${audits.length} invariants evaluated` : "Collecting browser signals…"}</small>
        </div>
        <div className="cdi-stats">
          <div><span>Run</span><strong>{audits.length || "—"}</strong></div>
          <div data-tone="pass"><span>Pass</span><strong>{browserReady ? auditCounts.pass : "—"}</strong></div>
          <div data-tone="warn"><span>Warn</span><strong>{browserReady ? auditCounts.warn : "—"}</strong></div>
          <div data-tone="fatal"><span>Fatal</span><strong>{browserReady ? auditCounts.fatal : "—"}</strong></div>
          <div data-tone="skip"><span>Skip</span><strong>{browserReady ? auditCounts.skip : "—"}</strong></div>
        </div>
      </div>

      <div className="cdi-toolbar">
        <div>
          <strong>Invariant results</strong>
          <span>{visibleAudits.length} visible</span>
        </div>
        <nav aria-label="Audit filters">
          {filters.map(([value, label]) => (
            <Button data-active={filter === value} key={value} onClick={() => onFilterChange(value)}>
              {label}
            </Button>
          ))}
        </nav>
      </div>

      <div className="cdi-grid">
        {!browserReady ? <div className="cdi-message">Running coherence checks…</div> : null}
        {browserReady && !visibleAudits.length ? <div className="cdi-message">No checks match this filter.</div> : null}
        {visibleAudits.map((audit) => {
          const meta = statusMeta[audit.status];
          const StatusIcon = meta.icon;
          const severity = warningSeverityIds.has(audit.id) ? "warn" : "fatal";
          return (
            <article className="cdi-card" data-status={audit.status} key={audit.id}>
              <div className="cdi-cardTop">
                <span className="cdi-id">{audit.id}</span>
                <span className="cdi-result"><StatusIcon aria-hidden="true" />{meta.label}</span>
              </div>
              <h3>{audit.name}</h3>
              <p>{audit.detail}</p>
              <footer>
                <span>Rule severity</span>
                <strong data-severity={severity}>{severity}</strong>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
