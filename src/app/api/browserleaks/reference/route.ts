export const dynamic = "force-dynamic";

type BrowserLeaksKey =
  | "canvas"
  | "contentFilters"
  | "features"
  | "fonts"
  | "geolocation"
  | "ipAddress"
  | "javaScript"
  | "tls"
  | "webGl"
  | "webRtc";

interface BrowserLeaksScrapedSection {
  fetchedAt: string;
  fields: string[];
  sections: Record<string, string[]>;
  source: string;
}

const browserLeaksPages = {
  canvas: "https://browserleaks.com/canvas",
  contentFilters: "https://browserleaks.com/proxy",
  features: "https://browserleaks.com/features",
  fonts: "https://browserleaks.com/fonts",
  geolocation: "https://browserleaks.com/geo",
  ipAddress: "https://browserleaks.com/ip",
  javaScript: "https://browserleaks.com/javascript",
  tls: "https://browserleaks.com/tls",
  webGl: "https://browserleaks.com/webgl",
  webRtc: "https://browserleaks.com/webrtc",
} satisfies Record<BrowserLeaksKey, string>;

const skipLinePattern = /^(?:BrowserLeaks|Home Page|More Tools|Settings|Privacy Policy|Leave a Comment.*|Further Reading|Enter IP Address.*|IP Address Lookup|Input|JavaScript Disabled|moc\.|BrowserLeaks ©.*)$/i;

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)));
}

function cleanLine(value: string) {
  return decodeHtml(value)
    .replace(/\s+/g, " ")
    .replace(/\s+\|/g, " |")
    .replace(/\|\s+/g, "| ")
    .replace(/^[•*-]\s*/, "")
    .trim();
}

function htmlToLines(html: string) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "\n")
    .replace(/<h([1-6])[^>]*>/gi, "\n### ")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<caption[^>]*>/gi, "\n### ")
    .replace(/<\/caption>/gi, "\n")
    .replace(/<tr[^>]*>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<t[dh][^>]*>/gi, "")
    .replace(/<\/t[dh]>/gi, " | ")
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|section|article|table|thead|tbody|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);

  return text;
}

function isUsefulField(label: string) {
  if (!label || label.length > 120) return false;
  if (skipLinePattern.test(label)) return false;
  if (/^\d+$/.test(label)) return false;
  if (/^\[[^\]]+\]$/.test(label)) return false;
  return true;
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function parseBrowserLeaksPage(html: string, source: string): BrowserLeaksScrapedSection {
  const lines = htmlToLines(html);
  const sections: Record<string, string[]> = {};
  const fields: string[] = [];
  let currentSection = "General";

  for (const line of lines) {
    if (line.startsWith("### ")) {
      const heading = line.slice(4).replace(/\s+\|.*$/, "").trim();
      if (isUsefulField(heading)) currentSection = heading;
      continue;
    }

    const rawLabel = line.includes("|") ? line.split("|")[0] : line;
    const label = rawLabel.replace(/\s+[:：]$/, "").trim();
    if (!isUsefulField(label)) continue;

    sections[currentSection] = sections[currentSection] ?? [];
    sections[currentSection].push(label);
    fields.push(label);
  }

  return {
    fetchedAt: new Date().toISOString(),
    fields: unique(fields),
    sections: Object.fromEntries(
      Object.entries(sections).map(([section, sectionFields]) => [section, unique(sectionFields)]),
    ),
    source,
  };
}

async function scrapePage(key: BrowserLeaksKey, source: string) {
  const response = await fetch(source, {
    cache: "no-store",
    headers: {
      "accept": "text/html,application/xhtml+xml",
      "user-agent": "FingerprintAnalyzer/1.0 (+https://fingerprint.hidemium.io)",
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`${key} scrape failed: ${response.status}`);
  }

  return [key, parseBrowserLeaksPage(await response.text(), source)] as const;
}

export async function GET() {
  const scrapedEntries = await Promise.allSettled(
    Object.entries(browserLeaksPages).map(([key, source]) => scrapePage(key as BrowserLeaksKey, source)),
  );

  const data: Partial<Record<BrowserLeaksKey, BrowserLeaksScrapedSection>> = {};
  const errors: Record<string, string> = {};

  for (const result of scrapedEntries) {
    if (result.status === "fulfilled") {
      const [key, section] = result.value;
      data[key] = section;
    } else {
      errors[String(Object.keys(errors).length)] = result.reason instanceof Error
        ? result.reason.message
        : "Unknown BrowserLeaks scrape error";
    }
  }

  return Response.json(
    {
      data,
      errors,
      fetchedAt: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
