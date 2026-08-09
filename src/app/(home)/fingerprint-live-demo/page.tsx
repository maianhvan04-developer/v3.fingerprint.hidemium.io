"use client";

import { useState } from "react";
import { SuspectScore } from "@/app/(home)/suspect-score/page";
import { VisitSummary } from "@/app/(home)/visit-summary/page";
import { useVisitorHistory } from "@/hooks/use-visitor-history";
import type { FingerprintSnapshot } from "@/types/fingerprint";

export interface FingerprintLiveDemoProps {
  onCalculationClick: () => void;
  onTrustedExampleChange: (value: boolean) => void;
  scanning: boolean;
  showTrustedExample: boolean;
  snapshot: FingerprintSnapshot | null;
}

export function FingerprintLiveDemo({
  onCalculationClick,
  onTrustedExampleChange,
  scanning,
  showTrustedExample,
  snapshot,
}: FingerprintLiveDemoProps) {
  const { summary, visitorId, visits } = useVisitorHistory(snapshot);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scoreReady = showTrustedExample || (!scanning && Boolean(snapshot));

  const activeIndex = Math.min(selectedIndex, Math.max(0, visits.length - 1));
  const visit = visits[activeIndex] ?? visits[0] ?? null;
  const compactScore = (
    <SuspectScore
      compact
      onCalculationClick={onCalculationClick}
      onTrustedExampleChange={onTrustedExampleChange}
      ready={scoreReady}
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
          onCalculationClick={onCalculationClick}
          onTrustedExampleChange={onTrustedExampleChange}
          ready={scoreReady}
          riskScore={snapshot?.scores.riskScore ?? 0}
          showTrustedExample={showTrustedExample}
        />
      </div>
    </div>
  );
}

export default FingerprintLiveDemo;
