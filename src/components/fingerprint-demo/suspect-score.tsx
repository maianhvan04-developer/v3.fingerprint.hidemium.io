"use client";

import type { ReactNode } from "react";

export interface SuspectScoreProps {
  compact?: boolean;
  onTrustedExampleChange: (value: boolean) => void;
  riskScore: number;
  showTrustedExample: boolean;
}

interface GaugeArc {
  score: number;
}

function getGaugeArc(value: number): GaugeArc {
  const score = Math.min(100, Math.max(0, Math.round(value)));
  return { score };
}

function CompactGlyph({ safe }: { safe: boolean }) {
  if (safe) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M10 2.2 16.2 4.7v4.8c0 3.8-2.5 6.5-6.2 8.3-3.7-1.8-6.2-4.5-6.2-8.3V4.7L10 2.2Z" />
        <path d="m6.9 9.8 2 2 4.3-4.4" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M10 2.4 18 16.8H2L10 2.4Z" />
      <path d="M10 7.2v4.5M10 14.3v.1" />
    </svg>
  );
}

function Gauge({ score }: { score: number }) {
  const gauge = getGaugeArc(score);
  const ticks = Array.from({ length: 13 }, (_, index) => index * 15 - 90);

  return (
    <div className="suspect-score__gauge">
      <svg
        aria-label={`Suspect score: ${gauge.score} out of 100`}
        className="suspect-score__gauge-svg"
        role="img"
        viewBox="0 0 180 108"
      >
        <g className="suspect-score__ticks">
          {ticks.map((angle) => (
            <line
              key={angle}
              transform={`rotate(${angle} 90 86)`}
              x1="90"
              x2="90"
              y1="5"
              y2="10"
            />
          ))}
        </g>
        <path className="suspect-score__gauge-track" d="M 20 86 A 70 70 0 0 1 160 86" />
        <path
          className="suspect-score__gauge-value"
          d="M 20 86 A 70 70 0 0 1 160 86"
          pathLength="100"
          strokeDasharray={`${gauge.score} 100`}
        />
      </svg>
      <div aria-hidden="true" className="suspect-score__gauge-copy">
        <strong className="suspect-score__value">{gauge.score}</strong>
        <span className="suspect-score__label">SUSPECT SCORE</span>
      </div>
    </div>
  );
}

export function SuspectScore({
  compact = false,
  onTrustedExampleChange,
  riskScore,
  showTrustedExample,
}: SuspectScoreProps): ReactNode {
  const liveScore = getGaugeArc(riskScore).score;
  const score = showTrustedExample ? 4 : liveScore;
  const safe = showTrustedExample || score < 15;
  const stateClass = safe ? "suspect-score--safe" : "suspect-score--high";

  if (compact) {
    return (
      <button
        aria-label={`${safe ? "Trusted" : "Suspect"} score ${score} out of 100. Switch to ${showTrustedExample ? "current device" : "trusted device example"}.`}
        aria-pressed={showTrustedExample}
        className={`suspect-score suspect-score--compact ${stateClass}`}
        onClick={() => onTrustedExampleChange(!showTrustedExample)}
        type="button"
      >
        <span className="suspect-score__compact-glyph">
          <CompactGlyph safe={safe} />
        </span>
        <span className="suspect-score__compact-label">{safe ? "Trusted score" : "Suspect score"}</span>
        <strong className="suspect-score__compact-value">{score}</strong>
      </button>
    );
  }

  return (
    <section
      aria-label="Visitor risk assessment"
      className={`suspect-score ${stateClass}`}
    >
      <p className="suspect-score__eyebrow">
        {showTrustedExample ? "THIS IS FAKE DATA" : "THIS IS REAL DATA"}
      </p>

      <Gauge score={score} />

      <div className="suspect-score__assessment">
        <h3 className="suspect-score__headline">
          {showTrustedExample ? (
            "This is how a trusted user looks"
          ) : safe ? (
            "You look like a trusted user"
          ) : (
            <>
              You look like a <span className="suspect-score__highlight">suspicious</span> user
            </>
          )}
        </h3>
        <p className="suspect-score__support">
          {showTrustedExample
            ? "No signs of fraud, bots, or spoofing."
            : safe
              ? "No strong fraud-risk signals were detected."
              : "We detected signals of fraud risk."}
        </p>
        <a className="suspect-score__calculation-link" href="#details">
          See how this is calculated
        </a>
      </div>

      <div aria-label="Risk score example" className="suspect-score__tabs" role="tablist">
        <button
          aria-selected={!showTrustedExample}
          className={`suspect-score__tab${showTrustedExample ? "" : " suspect-score__tab--active"}`}
          onClick={() => onTrustedExampleChange(false)}
          role="tab"
          type="button"
        >
          Your current device
        </button>
        <button
          aria-selected={showTrustedExample}
          className={`suspect-score__tab${showTrustedExample ? " suspect-score__tab--active" : ""}`}
          onClick={() => onTrustedExampleChange(true)}
          role="tab"
          type="button"
        >
          Try trusted device
        </button>
      </div>
    </section>
  );
}
