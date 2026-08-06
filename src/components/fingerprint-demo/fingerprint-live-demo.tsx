"use client";

import { useState } from "react";
import { SuspectScore } from "@/components/fingerprint-demo/suspect-score";
import { VisitSummary } from "@/components/fingerprint-demo/visit-summary";
import { useVisitorHistory } from "@/hooks/use-visitor-history";
import type { FingerprintSnapshot } from "@/types/fingerprint";

export interface FingerprintLiveDemoProps {
  scanning: boolean;
  snapshot: FingerprintSnapshot | null;
}

export function FingerprintLiveDemo({ scanning, snapshot }: FingerprintLiveDemoProps) {
  const { summary, visitorId, visits } = useVisitorHistory(snapshot);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showTrustedExample, setShowTrustedExample] = useState(false);

  const activeIndex = Math.min(selectedIndex, Math.max(0, visits.length - 1));
  const visit = visits[activeIndex] ?? visits[0] ?? null;
  const compactScore = (
    <SuspectScore
      compact
      onTrustedExampleChange={setShowTrustedExample}
      riskScore={snapshot?.scores.riskScore ?? 0}
      showTrustedExample={showTrustedExample}
    />
  );

  return (
    <div className="fingerprint-live-demo" data-scanning={scanning}>
      <VisitSummary
        compactScore={compactScore}
        onNextVisit={() => setSelectedIndex((current) => Math.min(Math.max(0, visits.length - 1), current + 1))}
        onPreviousVisit={() => setSelectedIndex((current) => Math.max(0, current - 1))}
        selectedIndex={activeIndex}
        summary={summary}
        visitorId={visitorId}
        visit={visit}
        visits={visits}
      />
      <div className="fingerprint-live-demo__score-panel">
        <SuspectScore
          onTrustedExampleChange={setShowTrustedExample}
          riskScore={snapshot?.scores.riskScore ?? 0}
          showTrustedExample={showTrustedExample}
        />
      </div>
    </div>
  );
}
