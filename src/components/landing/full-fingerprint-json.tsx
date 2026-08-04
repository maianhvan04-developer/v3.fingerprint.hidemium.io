"use client";

import {
  Activity,
  Clipboard,
  Download,
} from "lucide-react";
import {
  fingerprintModuleKeys,
  type CopyKind,
} from "@/types/fingerprint";

interface FullFingerprintJsonProps {
  collectedModuleCount: number;
  copied: CopyKind | null;
  fullJson: string;
  fullJsonReady: boolean;
  onCopyJson: () => void;
  onDownloadJson: () => void;
}

function formatPayloadSize(value: string) {
  const bytes = new TextEncoder().encode(value).byteLength;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function FullFingerprintJson({
  collectedModuleCount,
  copied,
  fullJson,
  fullJsonReady,
  onCopyJson,
  onDownloadJson,
}: FullFingerprintJsonProps) {
  const moduleTotal = fingerprintModuleKeys.length;
  const payloadSize = fullJsonReady ? formatPayloadSize(fullJson) : "Calculating…";

  return (
    <section
      aria-labelledby="full-fingerprint-json-title"
      className="of-fullJsonSection"
      id="full-fingerprint-json"
    >
      <div className="of-fullJsonCard">
        <header className="of-workspaceHeader">
          <div>
            <h2 id="full-fingerprint-json-title">Full Fingerprint JSON</h2>
            <p>Complete live payload from all collected fingerprint modules.</p>
          </div>
          <div className="of-analysisMeta">
            <span>Modules: {collectedModuleCount} / {moduleTotal}</span>
            <span>Payload: {payloadSize}</span>
            <span>Status: {fullJsonReady ? "Ready" : "Collecting"}</span>
          </div>
        </header>

        <div
          aria-busy={!fullJsonReady}
          aria-label="Full fingerprint JSON payload"
          className="of-jsonViewer"
        >
          <div className="of-jsonToolbar">
            <span>JSON</span>
            <div className="of-jsonActions">
              <button
                className={copied === "json" ? "of-jsonActionCopied" : "of-jsonAction"}
                disabled={!fullJsonReady}
                onClick={onCopyJson}
                type="button"
              >
                <Clipboard aria-hidden="true" />
                {copied === "json" ? "Copied" : "Copy JSON"}
              </button>
              <button
                className="of-jsonAction"
                disabled={!fullJsonReady}
                onClick={onDownloadJson}
                type="button"
              >
                <Download aria-hidden="true" />
                Download JSON
              </button>
            </div>
          </div>
          {fullJsonReady ? (
            <pre className="of-jsonCode"><code>{fullJson}</code></pre>
          ) : (
            <div className="of-jsonLoading" role="status" aria-live="polite">
              <Activity aria-hidden="true" />
              <strong>Collecting fingerprint modules…</strong>
              <span>{collectedModuleCount} of {moduleTotal} modules ready.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
