import type { VisitorVisitRecord } from "@/types/fingerprint";

type JsonRecord = Record<string, unknown>;

const serverApiOrigins = {
  ap: "https://ap.api.fpjs.io",
  eu: "https://eu.api.fpjs.io",
  us: "https://api.fpjs.io",
} as const;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => (
    isRecord(value) ? value[key] : undefined
  ), root);
}

function firstValue(root: unknown, paths: string[]) {
  for (const path of paths) {
    const value = getPath(root, path);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

function firstString(root: unknown, paths: string[]) {
  const value = firstValue(root, paths);
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

function firstNumber(root: unknown, paths: string[]) {
  const value = firstValue(root, paths);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === 1) return true;
  if (value === 0) return false;
  if (typeof value !== "string") return null;
  const normalized = value.toLowerCase().replace(/[\s_-]+/g, "");
  if (["true", "yes", "detected", "bad"].includes(normalized)) return true;
  if (["false", "no", "notdetected", "good", "none"].includes(normalized)) return false;
  return null;
}

function firstBoolean(root: unknown, paths: string[]) {
  for (const path of paths) {
    const parsed = toBoolean(getPath(root, path));
    if (parsed !== null) return parsed;
  }
  return null;
}

function toIsoDate(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = typeof value === "string" && /^\d+$/.test(value)
    ? new Date(Number(value))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeVisit(value: unknown): VisitorVisitRecord | null {
  const collectedAt = toIsoDate(firstValue(value, [
    "products.identification.data.timestamp",
    "identification.timestamp",
    "timestamp",
    "time",
  ]));
  if (!collectedAt) return null;

  const city = firstString(value, [
    "products.ipInfo.data.v4.geolocation.city.name",
    "products.ipInfo.data.v6.geolocation.city.name",
    "products.identification.data.ipLocation.city.name",
    "ipLocation.city.name",
    "ip_location.city.name",
  ]);
  const country = firstString(value, [
    "products.ipInfo.data.v4.geolocation.country.name",
    "products.ipInfo.data.v6.geolocation.country.name",
    "products.identification.data.ipLocation.country.name",
    "ipLocation.country.name",
    "ip_location.country.name",
  ]);

  return {
    browserName: firstString(value, [
      "products.identification.data.browserDetails.browserName",
      "browserDetails.browserName",
      "browser_details.browser_name",
    ]) ?? "Unknown",
    browserVersion: firstString(value, [
      "products.identification.data.browserDetails.browserFullVersion",
      "products.identification.data.browserDetails.browserMajorVersion",
      "browserDetails.browserFullVersion",
      "browserDetails.browserMajorVersion",
      "browser_details.browser_full_version",
      "browser_details.browser_major_version",
    ]) ?? "Unknown",
    city: [city, country].filter(Boolean).join(", ") || "Unavailable",
    collectedAt,
    countryCode: firstString(value, [
      "products.ipInfo.data.v4.geolocation.country.code",
      "products.ipInfo.data.v6.geolocation.country.code",
      "products.identification.data.ipLocation.country.code",
      "ipLocation.country.code",
      "ip_location.country.code",
    ]) ?? "",
    incognito: firstBoolean(value, [
      "products.incognito.data.result",
      "products.identification.data.incognito",
      "incognito",
    ]) ?? false,
    ipAddress: firstString(value, [
      "products.identification.data.ip",
      "products.ipInfo.data.v4.address",
      "products.ipInfo.data.v6.address",
      "ip",
      "ip_address",
    ]) ?? "Unavailable",
    latitude: firstNumber(value, [
      "products.ipInfo.data.v4.geolocation.latitude",
      "products.ipInfo.data.v6.geolocation.latitude",
      "products.identification.data.ipLocation.latitude",
      "ipLocation.latitude",
      "ip_location.latitude",
    ]),
    longitude: firstNumber(value, [
      "products.ipInfo.data.v4.geolocation.longitude",
      "products.ipInfo.data.v6.geolocation.longitude",
      "products.identification.data.ipLocation.longitude",
      "ipLocation.longitude",
      "ip_location.longitude",
    ]),
    requestId: firstString(value, [
      "products.identification.data.requestId",
      "identification.request_id",
      "requestId",
      "request_id",
    ]),
    vpn: firstBoolean(value, [
      "products.vpn.data.result",
      "vpn.result",
      "vpn",
    ]),
  };
}

function readVisits(payload: unknown) {
  const candidates = firstValue(payload, ["events", "visits"]);
  if (!Array.isArray(candidates)) return [];
  return candidates
    .map(normalizeVisit)
    .filter((visit): visit is VisitorVisitRecord => visit !== null)
    .sort((left, right) => Date.parse(right.collectedAt) - Date.parse(left.collectedAt))
    .slice(0, 24);
}

async function fetchFingerprintJson(url: string, apiKey: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Auth-API-Key": apiKey,
    },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return null;
  return response.json() as Promise<unknown>;
}

export async function GET(request: Request) {
  const apiKey = process.env.FINGERPRINT_SECRET_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { configured: false, source: "local", visits: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const visitorId = new URL(request.url).searchParams.get("visitorId")?.trim() ?? "";
  if (!/^[A-Za-z0-9_-]{6,200}$/.test(visitorId)) {
    return Response.json(
      { error: "Invalid visitorId" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const configuredRegion = process.env.FINGERPRINT_REGION
    ?? process.env.NEXT_PUBLIC_FINGERPRINT_REGION;
  const region = configuredRegion === "ap" || configuredRegion === "eu"
    ? configuredRegion
    : "us";
  const origin = serverApiOrigins[region];

  try {
    const searchPayload = await fetchFingerprintJson(
      `${origin}/events/search?limit=24&visitor_id=${encodeURIComponent(visitorId)}`,
      apiKey,
    );
    const searchVisits = readVisits(searchPayload);
    if (searchVisits.length) {
      return Response.json(
        { configured: true, source: "events-search", visits: searchVisits },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const historyPayload = await fetchFingerprintJson(
      `${origin}/visitors/${encodeURIComponent(visitorId)}?limit=24`,
      apiKey,
    );
    return Response.json(
      { configured: true, source: "visitor-history", visits: readVisits(historyPayload) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Fingerprint visit history lookup timed out" },
      { status: 504, headers: { "Cache-Control": "no-store" } },
    );
  }
}
