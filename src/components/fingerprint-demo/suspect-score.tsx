"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

export interface SuspectScoreProps {
  compact?: boolean;
  onCalculationClick: () => void;
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
  const { t } = useI18n();

  return (
    <div className="suspect-score__gauge">
      <svg
        aria-label={t("score.gaugeAria", { score: gauge.score })}
        className="suspect-score__gauge-svg"
        role="img"
        viewBox="0 0 120 120"
      >
        <circle className="suspect-score__gauge-track" cx="60" cy="60" r="49" />
        <circle
          className="suspect-score__gauge-value"
          cx="60"
          cy="60"
          pathLength="100"
          r="49"
          strokeDasharray={`${gauge.score} 100`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div aria-hidden="true" className="suspect-score__gauge-copy">
        <strong className="suspect-score__value">{gauge.score}</strong>
        <span className="suspect-score__label">{t("score.label")}</span>
      </div>
    </div>
  );
}

export function SuspectScore({
  compact = false,
  onCalculationClick,
  onTrustedExampleChange,
  riskScore,
  showTrustedExample,
}: SuspectScoreProps): ReactNode {
  const { t } = useI18n();
  const liveScore = getGaugeArc(riskScore).score;
  const score = showTrustedExample ? 4 : liveScore;
  const safe = showTrustedExample || score < 15;
  const stateClass = safe ? "suspect-score--safe" : "suspect-score--high";

  if (compact) {
    return (
      <button
        aria-label={t("score.compactAria", {
          score,
          target: showTrustedExample ? t("score.currentDevice") : t("score.trustedExample"),
          type: safe ? t("score.trusted") : t("score.suspect"),
        })}
        aria-pressed={showTrustedExample}
        className={`suspect-score suspect-score--compact ${stateClass}`}
        onClick={() => onTrustedExampleChange(!showTrustedExample)}
        type="button"
      >
        <span className="suspect-score__compact-glyph">
          <CompactGlyph safe={safe} />
        </span>
        <span className="suspect-score__compact-label">{safe ? t("score.trustedScore") : t("score.suspectScore")}</span>
        <strong className="suspect-score__compact-value">{score}</strong>
      </button>
    );
  }

  return (
    <section
      aria-label={t("score.assessment")}
      className={`suspect-score ${stateClass}`}
    >
      <p className="suspect-score__eyebrow">
        {showTrustedExample ? t("score.fakeData") : t("score.realData")}
      </p>

      <Gauge score={score} />

      <div className="suspect-score__assessment">
        <h3 className="suspect-score__headline">
          {showTrustedExample ? (
            t("score.trustedExampleTitle")
          ) : safe ? (
            t("score.trustedTitle")
          ) : (
            <>
              {t("score.suspiciousBefore")} <span className="suspect-score__highlight">{t("score.suspicious")}</span> {t("score.suspiciousAfter")}
            </>
          )}
        </h3>
        <p className="suspect-score__support">
          {showTrustedExample
            ? t("score.trustedExampleSupport")
            : safe
              ? t("score.trustedSupport")
              : t("score.suspiciousSupport")}
        </p>
        <a className="suspect-score__calculation-link" href="#details" onClick={onCalculationClick}>
          {t("score.calculation")}
        </a>
      </div>

      <div aria-label={t("score.tabsAria")} className="suspect-score__tabs" role="tablist">
        <button
          aria-selected={!showTrustedExample}
          className={`suspect-score__tab${showTrustedExample ? "" : " suspect-score__tab--active"}`}
          onClick={() => onTrustedExampleChange(false)}
          role="tab"
          type="button"
        >
          {t("score.yourDevice")}
        </button>
        <button
          aria-selected={showTrustedExample}
          className={`suspect-score__tab${showTrustedExample ? " suspect-score__tab--active" : ""}`}
          onClick={() => onTrustedExampleChange(true)}
          role="tab"
          type="button"
        >
          {t("score.tryTrusted")}
        </button>
      </div>
    </section>
  );
}
