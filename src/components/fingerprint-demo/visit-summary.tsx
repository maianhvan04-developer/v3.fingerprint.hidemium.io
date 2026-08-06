"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import type {
  VisitorHistorySummary,
  VisitorVisitRecord,
} from "@/types/fingerprint";

export interface VisitSummaryProps {
  compactScore?: ReactNode;
  onNextVisit: () => void;
  onPreviousVisit: () => void;
  selectedIndex: number;
  summary: VisitorHistorySummary;
  visitorId: string;
  visit: VisitorVisitRecord | null;
  visits: VisitorVisitRecord[];
}

interface SummaryCellProps {
  label: string;
  value: string;
}

interface DetailCellProps {
  label: string;
  tone?: "flagged" | "safe" | "unknown";
  value: string;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function formatVisitTime(value: string, selectedIndex: number) {
  if (selectedIndex === 0) return "Now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Previous visit";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

function getCountryName(countryCode: string) {
  if (!countryCode || countryCode === "Unknown" || countryCode === "Unavailable") {
    return "Location unavailable";
  }

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode.toUpperCase())
      ?? countryCode;
  } catch {
    return countryCode;
  }
}

function getLocationLabel(visit: VisitorVisitRecord) {
  const cityIsKnown = visit.city
    && visit.city !== "Unknown"
    && visit.city !== "Unavailable";

  return cityIsKnown ? visit.city : getCountryName(visit.countryCode);
}

function SummaryCell({ label, value }: SummaryCellProps) {
  return (
    <div className="visit-summary__summary-cell">
      <span className="visit-summary__summary-label">{label}</span>
      <span className="visit-summary__summary-value">{value}</span>
    </div>
  );
}

function DetailCell({ label, tone, value }: DetailCellProps) {
  const toneClass = tone ? ` visit-summary__detail--${tone}` : "";

  return (
    <div className={`visit-summary__detail${toneClass}`}>
      <span className="visit-summary__detail-label">{label}</span>
      <span className="visit-summary__detail-value">{value}</span>
    </div>
  );
}

function VisitMap({ visit }: { visit: VisitorVisitRecord | null }) {
  const location = visit ? getLocationLabel(visit) : "Locating your visit";

  return (
    <div className="visit-map" aria-label={`Map showing ${location}`} role="img">
      <Image
        alt=""
        aria-hidden="true"
        className="visit-map__source"
        height={84}
        priority
        src="/images/fingerprint-demo/current-visit-map.png"
        width={229}
      />
    </div>
  );
}

export function VisitSummary({
  compactScore,
  onNextVisit,
  onPreviousVisit,
  selectedIndex,
  summary,
  visitorId,
  visit,
  visits,
}: VisitSummaryProps): ReactNode {
  const hasVisits = visits.length > 0;
  const isFirstVisit = !hasVisits || selectedIndex <= 0;
  const isLastVisit = !hasVisits || selectedIndex >= visits.length - 1;
  const incognitoTone = visit ? (visit.incognito ? "flagged" : "safe") : "unknown";
  const vpnTone = visit
    ? visit.vpn === null
      ? "unknown"
      : visit.vpn
        ? "flagged"
        : "safe"
    : "unknown";
  const browser = visit
    ? `${visit.browserName} ${visit.browserVersion}`.trim()
    : "Collecting browser data";

  return (
    <section className="visit-summary" aria-labelledby="visit-summary-title">
      <header className="visit-summary__visitor-header">
        <h2 className="visit-summary__visitor-title" id="visit-summary-title">
          <span>Hello, visitor ID</span>
          <strong>{visitorId || "Collecting visitor ID"}</strong>
        </h2>
        {compactScore ? (
          <div className="visit-summary__compact-score">{compactScore}</div>
        ) : null}
      </header>

      <div className="visit-summary__summary-grid" aria-label="Weekly visit summary">
        <SummaryCell
          label="WEEKLY VISIT SUMMARY"
          value={`You visited ${summary.visitCount} ${pluralize(summary.visitCount, "time")}`}
        />
        <SummaryCell
          label="INCOGNITO"
          value={`${summary.incognitoSessions} ${pluralize(summary.incognitoSessions, "session")}`}
        />
        <SummaryCell
          label="IP ADDRESS"
          value={`${summary.uniqueIps} ${pluralize(summary.uniqueIps, "IP", "IPs")}`}
        />
        <SummaryCell
          label="GEOLOCATION"
          value={`${summary.uniqueLocations} ${pluralize(summary.uniqueLocations, "location")}`}
        />
      </div>

      <div className="visit-summary__history">
        <div className="visit-summary__history-title">YOUR RECENT VISITS</div>
        <div className="visit-summary__visit-carousel">
          <nav className="visit-summary__navigation" aria-label="Visit history navigation">
            <button
              aria-label="Previous visit"
              className="visit-summary__navigation-button"
              disabled={isFirstVisit}
              onClick={onPreviousVisit}
              type="button"
            >
              <ChevronUp aria-hidden="true" size={20} strokeWidth={1.7} />
            </button>
            <button
              aria-label="Next visit"
              className="visit-summary__navigation-button"
              disabled={isLastVisit}
              onClick={onNextVisit}
              type="button"
            >
              <ChevronDown aria-hidden="true" size={20} strokeWidth={1.7} />
            </button>
          </nav>

          <div className="visit-summary__visit-content">
            <div className="visit-summary__visit-overview">
              <div className="visit-summary__visit-location">
                <time
                  className="visit-summary__visit-time"
                  dateTime={visit?.collectedAt}
                  suppressHydrationWarning
                >
                  {visit ? formatVisitTime(visit.collectedAt, selectedIndex) : "Collecting..."}
                </time>
                <span className="visit-summary__visit-place">
                  {visit ? getLocationLabel(visit) : "Locating your visit"}
                </span>
              </div>
              <VisitMap visit={visit} />
            </div>

            <div className="visit-summary__details">
              <DetailCell label="IP Address" value={visit?.ipAddress ?? "Collecting..."} />
              <DetailCell
                label="Incognito mode"
                tone={incognitoTone}
                value={visit ? (visit.incognito ? "Detected" : "Not Detected") : "Checking..."}
              />
              <DetailCell label="Browser" value={browser} />
              <DetailCell
                label="VPN"
                tone={vpnTone}
                value={visit
                  ? visit.vpn === null
                    ? "Unknown"
                    : visit.vpn
                      ? "Detected"
                      : "Not Detected"
                  : "Checking..."}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
