import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import type { CopyKind, FingerprintModule } from "@/types/fingerprint";

interface FingerprintModulesProps {
  copied: CopyKind | null;
  fullJson: string;
  modules: FingerprintModule[];
  onCopyJson: () => void;
  onDownloadJson: () => void;
}

function ModuleRow({ index, module }: { index: number; module: FingerprintModule }) {
  return (
    <details className={`module-item ${module.issues ? "module-has-lies" : "module-clean"}`}>
      <summary aria-label={`${module.name} module`}>
        <span className="module-title">
          <span className="module-number">{String(index + 1).padStart(2, "0")}</span>
          <span><b>{module.name}</b><small>{module.description}</small></span>
        </span>
        <span className="module-meta">
          <span className={module.issues ? "module-lies" : "module-clean-tag"}>
            {module.issues ? `${module.issues} LIES` : "✓ CLEAN"}
          </span>
          <code>{module.hash.slice(0, 12)}…</code>
        </span>
        <span className="module-chevron">⌄</span>
      </summary>
      <div className="module-body">
        <div className="module-hash">SHA-256 <code>{module.hash}</code></div>
        <pre>{JSON.stringify(module.result, null, 2)}</pre>
      </div>
    </details>
  );
}

export function FingerprintModules({
  copied,
  fullJson,
  modules,
  onCopyJson,
  onDownloadJson,
}: FingerprintModulesProps) {
  return (
    <section className="modules-section">
      <h2>🧬 CreepJS Fingerprint Modules</h2>
      <p className="section-subtitle">30 modules — each module has its own SHA-256 hash.</p>
      <div className="modules-list">
        {!modules.length ? <div className="module-loading">Collecting 30 browser modules…</div> : null}
        {modules.map((module, index) => <ModuleRow index={index} key={module.name} module={module} />)}
      </div>
      <div className="full-json">
        <div className="json-head">
          <h3>📋 Full Fingerprint JSON</h3>
          <div>
            <CopyButton
              copied={copied === "json"}
              copiedLabel="Copied!"
              label="Copy JSON"
              onClick={onCopyJson}
            />
            <Button className="copy-button" onClick={onDownloadJson}>↓ Download</Button>
          </div>
        </div>
        <pre>{fullJson}</pre>
      </div>
    </section>
  );
}
