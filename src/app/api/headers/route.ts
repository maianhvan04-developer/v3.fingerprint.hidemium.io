export const dynamic = "force-dynamic";

const allowedHeaders = [
  "accept",
  "accept-encoding",
  "accept-language",
  "cache-control",
  "connection",
  "dnt",
  "host",
  "origin",
  "pragma",
  "priority",
  "referer",
  "sec-ch-ua",
  "sec-ch-ua-arch",
  "sec-ch-ua-bitness",
  "sec-ch-ua-full-version-list",
  "sec-ch-ua-mobile",
  "sec-ch-ua-model",
  "sec-ch-ua-platform",
  "sec-ch-ua-platform-version",
  "sec-ch-prefers-color-scheme",
  "sec-ch-prefers-reduced-motion",
  "sec-fetch-dest",
  "sec-fetch-mode",
  "sec-fetch-site",
  "sec-fetch-user",
  "save-data",
  "upgrade-insecure-requests",
  "user-agent",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-port",
  "x-forwarded-proto",
  "x-real-ip",
] as const;

export async function GET(request: Request) {
  const headers = Object.fromEntries(allowedHeaders.flatMap((name) => {
    const value = request.headers.get(name);
    return value ? [[name, value]] : [];
  }));

  return Response.json(
    { headers },
    { headers: { "cache-control": "no-store" } },
  );
}
