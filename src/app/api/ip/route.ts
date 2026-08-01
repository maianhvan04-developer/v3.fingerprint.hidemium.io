import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type JsonRecord = Record<string, unknown>;

async function readJson(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "user-agent": "FingerprintChecked/1.0" },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`IP provider returned ${response.status}`);
  return response.json() as Promise<JsonRecord>;
}

export async function GET() {
  try {
    const data = await readJson("https://ipwho.is/");
    if (data.success !== false && data.ip) {
      return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
    }
  } catch {
    // Continue with the secondary provider.
  }

  try {
    const data = await readJson("https://ipapi.co/json/");
    const latitude = typeof data.latitude === "number" ? data.latitude : undefined;
    const longitude = typeof data.longitude === "number" ? data.longitude : undefined;
    return NextResponse.json(
      {
        success: Boolean(data.ip),
        ip: data.ip,
        type: String(data.ip ?? "").includes(":") ? "IPv6" : "IPv4",
        country: data.country_name,
        country_code: data.country_code,
        region: data.region,
        city: data.city,
        postal: data.postal,
        latitude,
        longitude,
        connection: {
          asn: data.asn,
          org: data.org,
          isp: data.org,
        },
        timezone: { id: data.timezone },
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { success: false },
      { headers: { "cache-control": "no-store" } },
    );
  }
}
