import type { FingerprintServerEvent } from "@/types/fingerprint";

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
  if (["true", "yes", "detected", "bad", "suspicious", "malicious"].includes(normalized)) {
    return true;
  }
  if (["false", "no", "notdetected", "good", "safe", "none"].includes(normalized)) {
    return false;
  }
  return null;
}

function firstBoolean(root: unknown, paths: string[]) {
  for (const path of paths) {
    const value = getPath(root, path);
    const parsed = toBoolean(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function combinedBoolean(root: unknown, paths: string[]) {
  const values = paths
    .map((path) => toBoolean(getPath(root, path)))
    .filter((value): value is boolean => value !== null);
  if (!values.length) return null;
  return values.some(Boolean);
}

function normalizeEvent(payload: unknown): FingerprintServerEvent {
  const ipBlocklist = firstBoolean(payload, [
    "products.ipBlocklist.data.result",
    "ip_blocklist.result",
  ]) ?? combinedBoolean(payload, [
    "products.ipBlocklist.data.details.attackSource",
    "products.ipBlocklist.data.details.emailSpamAttackSource",
    "ip_blocklist.attack_source",
    "ip_blocklist.email_spam_attack_source",
  ]);

  return {
    asn: firstString(payload, [
      "products.ipInfo.data.v4.asn.asn",
      "products.ipInfo.data.v6.asn.asn",
      "ip_info.v4.asn.asn",
      "ip_info.v6.asn.asn",
      "asn",
    ]),
    bot: firstBoolean(payload, [
      "products.botd.data.bot.result",
      "products.botd.data.result",
      "bot",
    ]),
    browserName: firstString(payload, [
      "products.identification.data.browserDetails.browserName",
      "identification.browser_details.browser_name",
      "browser_details.browser_name",
    ]),
    browserVersion: firstString(payload, [
      "products.identification.data.browserDetails.browserFullVersion",
      "products.identification.data.browserDetails.browserMajorVersion",
      "identification.browser_details.browser_full_version",
      "identification.browser_details.browser_major_version",
      "identification.browser_details.browser_version",
      "browser_details.browser_full_version",
      "browser_details.browser_major_version",
      "browser_details.browser_version",
    ]),
    city: firstString(payload, [
      "products.ipInfo.data.v4.geolocation.city.name",
      "products.ipInfo.data.v6.geolocation.city.name",
      "products.identification.data.ipLocation.city.name",
      "ip_info.v4.geolocation.city_name",
      "ip_info.v6.geolocation.city_name",
      "ip_location.city.name",
    ]),
    country: firstString(payload, [
      "products.ipInfo.data.v4.geolocation.country.name",
      "products.ipInfo.data.v6.geolocation.country.name",
      "products.identification.data.ipLocation.country.name",
      "ip_info.v4.geolocation.country_name",
      "ip_info.v6.geolocation.country_name",
      "ip_location.country.name",
    ]),
    countryCode: firstString(payload, [
      "products.ipInfo.data.v4.geolocation.country.code",
      "products.ipInfo.data.v6.geolocation.country.code",
      "products.identification.data.ipLocation.country.code",
      "ip_info.v4.geolocation.country_code",
      "ip_info.v6.geolocation.country_code",
      "ip_location.country.code",
    ]),
    developerTools: firstBoolean(payload, [
      "products.developerTools.data.result",
      "developer_tools",
    ]),
    device: firstString(payload, [
      "products.identification.data.browserDetails.device",
      "identification.browser_details.device",
      "browser_details.device",
    ]),
    highActivityDevice: firstBoolean(payload, [
      "products.highActivityDevice.data.result",
      "high_activity_device",
    ]),
    hosting: firstBoolean(payload, [
      "products.ipInfo.data.v4.datacenter.result",
      "products.ipInfo.data.v6.datacenter.result",
      "ip_info.v4.datacenter.result",
      "ip_info.v6.datacenter.result",
      "hosting",
    ]),
    incognito: firstBoolean(payload, [
      "products.incognito.data.result",
      "incognito",
    ]),
    ipAddress: firstString(payload, [
      "products.identification.data.ip",
      "products.ipInfo.data.v4.address",
      "products.ipInfo.data.v6.address",
      "identification.ip",
      "ip_address",
    ]),
    ipBlocklist,
    isp: firstString(payload, [
      "products.ipInfo.data.v4.asn.name",
      "products.ipInfo.data.v6.asn.name",
      "ip_info.v4.asn.name",
      "ip_info.v6.asn.name",
      "isp",
    ]),
    latitude: firstNumber(payload, [
      "products.ipInfo.data.v4.geolocation.latitude",
      "products.ipInfo.data.v6.geolocation.latitude",
      "products.identification.data.ipLocation.latitude",
      "ip_info.v4.geolocation.latitude",
      "ip_info.v6.geolocation.latitude",
      "ip_location.latitude",
    ]),
    longitude: firstNumber(payload, [
      "products.ipInfo.data.v4.geolocation.longitude",
      "products.ipInfo.data.v6.geolocation.longitude",
      "products.identification.data.ipLocation.longitude",
      "ip_info.v4.geolocation.longitude",
      "ip_info.v6.geolocation.longitude",
      "ip_location.longitude",
    ]),
    os: firstString(payload, [
      "products.identification.data.browserDetails.os",
      "identification.browser_details.os",
      "browser_details.os",
    ]),
    osVersion: firstString(payload, [
      "products.identification.data.browserDetails.osVersion",
      "identification.browser_details.os_version",
      "browser_details.os_version",
    ]),
    privacySettings: firstBoolean(payload, [
      "products.privacySettings.data.result",
      "privacy_settings",
    ]),
    proxy: firstBoolean(payload, [
      "products.proxy.data.result",
      "proxy",
    ]),
    rareDevice: firstBoolean(payload, [
      "products.rareDevice.data.result",
      "rare_device",
    ]),
    suspectScore: firstNumber(payload, [
      "products.suspectScore.data.result",
      "suspect_score",
    ]),
    tampering: firstBoolean(payload, [
      "products.tampering.data.result",
      "tampering.result",
      "tampering",
    ]),
    timezone: firstString(payload, [
      "products.ipInfo.data.v4.geolocation.timezone",
      "products.ipInfo.data.v6.geolocation.timezone",
      "products.identification.data.ipLocation.timezone",
      "ip_info.v4.geolocation.timezone",
      "ip_info.v6.geolocation.timezone",
      "ip_location.timezone",
    ]),
    tor: firstBoolean(payload, [
      "products.tor.data.result",
      "tor",
    ]),
    virtualMachine: firstBoolean(payload, [
      "products.virtualMachine.data.result",
      "virtual_machine",
    ]),
    vpn: firstBoolean(payload, [
      "products.vpn.data.result",
      "vpn.result",
      "vpn",
    ]),
    visitorId: firstString(payload, [
      "products.identification.data.visitorId",
      "identification.visitor_id",
      "visitor_id",
    ]),
  };
}

export async function GET(request: Request) {
  const apiKey = process.env.FINGERPRINT_SECRET_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { configured: false, event: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const requestId = new URL(request.url).searchParams.get("requestId")?.trim() ?? "";
  if (!/^[A-Za-z0-9._:-]{6,200}$/.test(requestId)) {
    return Response.json(
      { error: "Invalid requestId" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const configuredRegion = process.env.FINGERPRINT_REGION
    ?? process.env.NEXT_PUBLIC_FINGERPRINT_REGION;
  const region = configuredRegion === "ap" || configuredRegion === "eu"
    ? configuredRegion
    : "us";

  try {
    const response = await fetch(
      `${serverApiOrigins[region]}/events/${encodeURIComponent(requestId)}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Auth-API-Key": apiKey,
        },
        signal: AbortSignal.timeout(8_000),
      },
    );

    if (!response.ok) {
      return Response.json(
        { error: "Fingerprint event lookup failed" },
        { status: response.status, headers: { "Cache-Control": "no-store" } },
      );
    }

    const payload = await response.json() as unknown;
    return Response.json(
      { configured: true, event: normalizeEvent(payload) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Fingerprint event lookup timed out" },
      { status: 504, headers: { "Cache-Control": "no-store" } },
    );
  }
}
