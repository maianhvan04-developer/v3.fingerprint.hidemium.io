export const dynamic = "force-dynamic";

const allowedHeaders = [
  "accept",
  "accept-encoding",
  "accept-language",
  "connection",
  "host",
  "sec-ch-ua",
  "sec-ch-ua-mobile",
  "sec-ch-ua-platform",
  "sec-fetch-dest",
  "sec-fetch-mode",
  "sec-fetch-site",
  "upgrade-insecure-requests",
  "user-agent",
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
