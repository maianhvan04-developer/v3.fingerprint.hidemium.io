import type { AuditCounts, AuditFilter, AuditItem, AuditStatus } from "@/types/fingerprint";

const filters: Array<[AuditFilter, string]> = [
  ["all", "All"],
  ["fail", "Fail only"],
  ["fatal", "Fatal only"],
  ["skip", "Not evaluable"],
];
const warningSeverityIds = ["C-015", "C-031", "C-041"];

function StatusTag({ status }: { status: AuditStatus }) {
  const labels: Record<AuditStatus, string> = {
    fatal: "FAIL",
    pass: "PASS",
    skip: "SKIP",
    warn: "WARN",
  };
  return <span className={`status-tag status-${status}`}>{labels[status]}</span>;
}

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
  return (
    <section className="audit-section">
      <div className="eyebrow">🧬 CDI v2.0 · Coherence Contract</div>
      <h2>Coherent Device Identity Validator</h2>
      <p className="section-subtitle">
        Checks the current browser profile against cdi-core@2.0, invariants C-001…C-052. One failing fatal means the profile does not qualify for state:active. Rules that cannot be evaluated from a page are marked SKIP and are never counted as passes.
      </p>
      <div className="audit-summary">
        <div className="verdict">
          <span>RESULT</span>
          <strong className={`verdict-${auditVerdict.toLowerCase()}`}>{auditVerdict}</strong>
        </div>
        <div className="audit-stats">
          <div><b>{audits.length || "—"}</b><span>RUN</span></div>
          <div className="stat-pass"><b>{browserReady ? auditCounts.pass : "—"}</b><span>PASS</span></div>
          <div className="stat-warn"><b>{browserReady ? auditCounts.warn : "—"}</b><span>WARN</span></div>
          <div className="stat-fatal"><b>{browserReady ? auditCounts.fatal : "—"}</b><span>FATAL</span></div>
          <div className="stat-skip"><b>{browserReady ? auditCounts.skip : "—"}</b><span>SKIP</span></div>
        </div>
        <div className="audit-filters">
          {filters.map(([value, label]) => (
            <button className={filter === value ? "active" : ""} key={value} onClick={() => onFilterChange(value)} type="button">
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="audit-list">
        {!browserReady ? <div className="audit-loading">Running coherence checks…</div> : null}
        {browserReady && !visibleAudits.length ? <div className="audit-empty">No checks match this filter.</div> : null}
        {visibleAudits.map((audit) => {
          const warnSeverity = warningSeverityIds.includes(audit.id);
          return (
            <div className={`audit-item audit-${audit.status}`} key={audit.id}>
              <span className="audit-mark" aria-hidden="true">
                {audit.status === "pass" ? "✓" : audit.status === "fatal" ? "✕" : audit.status === "warn" ? "!" : "–"}
              </span>
              <span className="audit-number">{audit.id}</span>
              <div className="audit-body"><h3>{audit.name}</h3><p>{audit.detail}</p></div>
              <div className="audit-tags">
                <StatusTag status={audit.status} />
                <span className={`severity-tag ${warnSeverity ? "severity-warn" : "severity-fatal"}`}>
                  {warnSeverity ? "WARN" : "FATAL"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
