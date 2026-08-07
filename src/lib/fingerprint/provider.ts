import "client-only";

import type {
  FingerprintIdentity,
  FingerprintServerEvent,
} from "@/types/fingerprint";

type FingerprintRegion = "ap" | "eu" | "us";

interface FingerprintExtendedIdentity {
  browserName: string;
  browserVersion: string;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  device: string;
  incognito: boolean;
  ipAddress: string;
  latitude: number | null;
  longitude: number | null;
  os: string;
  osVersion: string;
  timezone: string | null;
}

export interface OfficialFingerprintResult {
  event: FingerprintServerEvent | null;
  extended: FingerprintExtendedIdentity | null;
  identity: FingerprintIdentity | null;
}

function getRegion(): FingerprintRegion {
  const region = process.env.NEXT_PUBLIC_FINGERPRINT_REGION;
  return region === "ap" || region === "eu" ? region : "us";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

async function fetchServerEvent(requestId: string) {
  try {
    const response = await fetch(
      `/api/fingerprint/event?requestId=${encodeURIComponent(requestId)}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(7_000),
      },
    );
    if (!response.ok) return null;
    const payload = await response.json() as unknown;
    if (!isRecord(payload) || payload.configured !== true || !isRecord(payload.event)) {
      return null;
    }
    return payload.event as unknown as FingerprintServerEvent;
  } catch {
    return null;
  }
}

async function collectProFingerprint(apiKey: string): Promise<OfficialFingerprintResult> {
  const FingerprintPro = await import("@fingerprintjs/fingerprintjs-pro");
  const agent = await FingerprintPro.load({ apiKey, region: getRegion() });
  const result = await agent.get({ extendedResult: true, timeout: 10_000 });
  const location = result.ipLocation;
  const requestId = result.requestId || null;

  return {
    event: requestId ? await fetchServerEvent(requestId) : null,
    extended: {
      browserName: result.browserName,
      browserVersion: result.browserVersion,
      city: location?.city?.name ?? null,
      country: location?.country?.name ?? null,
      countryCode: location?.country?.code ?? null,
      device: result.device,
      incognito: result.incognito,
      ipAddress: result.ip,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      os: result.os,
      osVersion: result.osVersion,
      timezone: location?.timezone ?? null,
    },
    identity: {
      confidence: result.confidence.score,
      provider: "fingerprint-pro",
      requestId,
      visitorFound: result.visitorFound,
      visitorId: result.visitorId,
    },
  };
}

async function collectOpenSourceFingerprint(): Promise<OfficialFingerprintResult> {
  const FingerprintJS = await import("@fingerprintjs/fingerprintjs");
  const agent = await FingerprintJS.load({ monitoring: false });
  const result = await agent.get();

  return {
    event: null,
    extended: null,
    identity: {
      confidence: result.confidence.score,
      provider: "fingerprintjs",
      requestId: null,
      visitorFound: null,
      visitorId: result.visitorId,
    },
  };
}

export async function collectOfficialFingerprint(): Promise<OfficialFingerprintResult> {
  const apiKey = process.env.NEXT_PUBLIC_FINGERPRINT_API_KEY?.trim();

  if (apiKey) {
    try {
      return await collectProFingerprint(apiKey);
    } catch {
      // A blocked or misconfigured Pro agent must not prevent the local scan.
    }
  }

  try {
    return await collectOpenSourceFingerprint();
  } catch {
    return { event: null, extended: null, identity: null };
  }
}
