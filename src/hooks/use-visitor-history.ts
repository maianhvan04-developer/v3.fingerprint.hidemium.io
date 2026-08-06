"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  FingerprintSnapshot,
  VisitorHistoryData,
  VisitorHistorySummary,
  VisitorVisitRecord,
} from "@/types/fingerprint";

const storageKey = "fingerprint-analyzer.visitor-history.v1";
const weekInMilliseconds = 7 * 24 * 60 * 60 * 1_000;
const visitorAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function createVisitorId(compositeHash: string) {
  const pairs = compositeHash.match(/.{1,2}/g) ?? [];
  const encoded = pairs
    .slice(0, 20)
    .map((pair) => visitorAlphabet[Number.parseInt(pair, 16) % visitorAlphabet.length])
    .join("");
  return encoded.padEnd(20, "0");
}

function isVisitRecord(value: unknown): value is VisitorVisitRecord {
  if (!value || typeof value !== "object") return false;
  const visit = value as Partial<VisitorVisitRecord>;
  return typeof visit.collectedAt === "string"
    && typeof visit.ipAddress === "string"
    && typeof visit.city === "string"
    && typeof visit.browserName === "string"
    && typeof visit.browserVersion === "string"
    && typeof visit.countryCode === "string"
    && typeof visit.incognito === "boolean"
    && (typeof visit.vpn === "boolean" || visit.vpn === null)
    && (typeof visit.latitude === "number" || visit.latitude === null)
    && (typeof visit.longitude === "number" || visit.longitude === null);
}

function readStoredHistory(visitorId: string) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "null") as unknown;
    if (!stored || typeof stored !== "object") return [];
    const history = stored as Partial<VisitorHistoryData>;
    if (history.visitorId !== visitorId || !Array.isArray(history.visits)) return [];
    return history.visits.filter(isVisitRecord);
  } catch {
    return [];
  }
}

function createVisit(snapshot: FingerprintSnapshot): VisitorVisitRecord {
  return {
    browserName: snapshot.browser.name,
    browserVersion: snapshot.browser.version,
    city: snapshot.network.city,
    collectedAt: snapshot.collectedAt,
    countryCode: snapshot.network.countryCode,
    incognito: snapshot.privacy.headless === "Possible" || snapshot.privacy.webDriver === "Detected",
    ipAddress: snapshot.network.ipAddress,
    latitude: snapshot.network.latitude,
    longitude: snapshot.network.longitude,
    vpn: snapshot.network.vpn,
  };
}

function summarizeVisits(visits: VisitorVisitRecord[]): VisitorHistorySummary {
  const usable = (value: string) => value && value !== "Unavailable" && value !== "Unknown";
  return {
    incognitoSessions: visits.filter((visit) => visit.incognito).length,
    uniqueIps: new Set(visits.map((visit) => visit.ipAddress).filter(usable)).size,
    uniqueLocations: new Set(visits.map((visit) => visit.city).filter(usable)).size,
    visitCount: visits.length,
  };
}

export function useVisitorHistory(snapshot: FingerprintSnapshot | null) {
  const visitorId = useMemo(
    () => snapshot ? createVisitorId(snapshot.compositeHash) : "collecting-visitor-id",
    [snapshot],
  );
  const [visits, setVisits] = useState<VisitorVisitRecord[]>([]);

  useEffect(() => {
    if (!snapshot) return;

    const now = Date.now();
    const currentVisit = createVisit(snapshot);
    const storedVisits = readStoredHistory(visitorId)
      .filter((visit) => now - new Date(visit.collectedAt).getTime() <= weekInMilliseconds);
    const exists = storedVisits.some((visit) => visit.collectedAt === currentVisit.collectedAt);
    const nextVisits = (exists ? storedVisits : [currentVisit, ...storedVisits])
      .sort((left, right) => Date.parse(right.collectedAt) - Date.parse(left.collectedAt))
      .slice(0, 24);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ visitorId, visits: nextVisits } satisfies VisitorHistoryData));
    } catch {
      // The live UI still works with the in-memory history when storage is blocked.
    }
    let cancelled = false;
    window.queueMicrotask(() => {
      if (!cancelled) setVisits(nextVisits);
    });
    return () => {
      cancelled = true;
    };
  }, [snapshot, visitorId]);

  const visibleVisits = useMemo(
    () => visits.length || !snapshot ? visits : [createVisit(snapshot)],
    [snapshot, visits],
  );
  const summary = useMemo(() => summarizeVisits(visibleVisits), [visibleVisits]);

  return { summary, visitorId, visits: visibleVisits };
}
