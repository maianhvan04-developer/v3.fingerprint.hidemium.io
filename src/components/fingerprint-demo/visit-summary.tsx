"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useI18n, type Locale, type Translate } from "@/lib/i18n";
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

function formatVisitTime(value: string, selectedIndex: number, locale: Locale, t: Translate) {
  if (selectedIndex === 0) return t("visit.now");

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t("visit.previous");

  return new Intl.DateTimeFormat(locale === "cn" ? "zh-CN" : locale, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

function getCountryName(countryCode: string, locale: Locale, t: Translate) {
  if (!countryCode || countryCode === "Unknown" || countryCode === "Unavailable") {
    return t("visit.locationUnavailable");
  }

  try {
    return new Intl.DisplayNames([locale === "cn" ? "zh-CN" : locale], { type: "region" }).of(countryCode.toUpperCase())
      ?? countryCode;
  } catch {
    return countryCode;
  }
}

function getLocationLabel(visit: VisitorVisitRecord, locale: Locale, t: Translate) {
  const cityIsKnown = visit.city
    && visit.city !== "Unknown"
    && visit.city !== "Unavailable";

  return cityIsKnown ? visit.city : getCountryName(visit.countryCode, locale, t);
}

function getMapCoordinates(visit: VisitorVisitRecord | null): [number, number] | null {
  const latitude = visit?.latitude;
  const longitude = visit?.longitude;

  if (
    latitude === null
    || latitude === undefined
    || longitude === null
    || longitude === undefined
    || !Number.isFinite(latitude)
    || !Number.isFinite(longitude)
    || latitude < -90
    || latitude > 90
    || longitude < -180
    || longitude > 180
  ) {
    return null;
  }

  return [longitude, latitude];
}

function getMapImageUrl(coordinates: [number, number]) {
  const [longitude, latitude] = coordinates;
  const zoom = 12;
  const tileScale = 256 * 2 ** zoom;
  const longitudeOffset = (360 * 350 / tileScale) / 2;
  const latitudeOffset = ((360 * 200 / tileScale) * Math.cos(latitude * Math.PI / 180)) / 2;
  const boundingBox = [
    longitude - longitudeOffset,
    latitude - latitudeOffset,
    longitude + longitudeOffset,
    latitude + latitudeOffset,
  ].map((coordinate) => coordinate.toFixed(6)).join(",");
  const parameters = new URLSearchParams({
    bbox: boundingBox,
    bboxSR: "4326",
    f: "image",
    format: "png",
    imageSR: "4326",
    size: "350,200",
    transparent: "false",
  });

  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/export?${parameters.toString()}`;
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
  const { locale, t } = useI18n();
  const location = visit ? getLocationLabel(visit, locale, t) : t("visit.locating");
  const coordinates = getMapCoordinates(visit);

  return (
    <div className="visit-map" aria-label={t("visit.map", { location })} role="img">
      {coordinates ? (
        <>
          <Image
            alt={t("visit.map", { location })}
            className="visit-map__image"
            height={200}
            loading="eager"
            src={getMapImageUrl(coordinates)}
            unoptimized
            width={350}
          />
          <span className="visit-map__marker" aria-hidden="true">
            <MapPin />
          </span>
        </>
      ) : (
        <span className="visit-map__fallback">{t("visit.locationUnavailable")}</span>
      )}
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
  const { locale, t } = useI18n();
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
    : t("visit.collecting");

  return (
    <section className="visit-summary" aria-labelledby="visit-summary-title">
      <header className="visit-summary__visitor-header">
        <h2 className="visit-summary__visitor-title" id="visit-summary-title">
          <span>{t("visit.hello")}</span>
          <strong>{visitorId || t("visit.collectingVisitorId")}</strong>
        </h2>
        {compactScore ? (
          <div className="visit-summary__compact-score">{compactScore}</div>
        ) : null}
      </header>

      <div className="visit-summary__summary-grid" aria-label={t("visit.weeklySummaryAria")}>
        <SummaryCell
          label={t("visit.weeklySummary")}
          value={t("visit.visitsValue", { count: summary.visitCount })}
        />
        <SummaryCell
          label={t("visit.incognito")}
          value={t("visit.sessionsValue", { count: summary.incognitoSessions })}
        />
        <SummaryCell
          label={t("visit.ipAddress")}
          value={t("visit.ipsValue", { count: summary.uniqueIps })}
        />
        <SummaryCell
          label={t("visit.geolocation")}
          value={t("visit.locationsValue", { count: summary.uniqueLocations })}
        />
      </div>

      <div className="visit-summary__history">
        <div className="visit-summary__history-title">{t("visit.recentVisits")}</div>
        <div className="visit-summary__visit-carousel">
          <nav className="visit-summary__navigation" aria-label={t("visit.navigation")}>
            <button
              aria-label={t("visit.previous")}
              className="visit-summary__navigation-button"
              disabled={isFirstVisit}
              onClick={onPreviousVisit}
              type="button"
            >
              <ChevronUp aria-hidden="true" size={20} strokeWidth={1.7} />
            </button>
            <button
              aria-label={t("visit.next")}
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
                  {visit ? formatVisitTime(visit.collectedAt, selectedIndex, locale, t) : t("visit.collecting")}
                </time>
                <span className="visit-summary__visit-place">
                  {visit ? getLocationLabel(visit, locale, t) : t("visit.locating")}
                </span>
              </div>
              <VisitMap visit={visit} />
            </div>

            <div className="visit-summary__details">
              <DetailCell label={t("fields.ipAddress")} value={visit?.ipAddress ?? t("visit.collecting")} />
              <DetailCell
                label={t("visit.incognitoMode")}
                tone={incognitoTone}
                value={visit ? (visit.incognito ? t("common.detected") : t("common.notDetected")) : t("common.checking")}
              />
              <DetailCell label={t("fields.browser")} value={browser} />
              <DetailCell
                label={t("visit.vpn")}
                tone={vpnTone}
                value={visit
                  ? visit.vpn === null
                    ? t("common.unknown")
                    : visit.vpn
                      ? t("common.detected")
                      : t("common.notDetected")
                  : t("common.checking")}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
