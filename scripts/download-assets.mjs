import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const researchDir = path.join(root, "docs", "research");
const imageDir = path.join(root, "public", "images", "nikolas");
const seoDir = path.join(root, "public", "seo");
const fontDir = path.join(root, "public", "fonts");

const [desktopRaw, contentRaw] = await Promise.all([
  readFile(path.join(researchDir, "nikolas-global-extraction.json"), "utf8"),
  readFile(path.join(researchDir, "nikolas-content-data.json"), "utf8"),
]);

const desktop = JSON.parse(desktopRaw);
const content = JSON.parse(contentRaw);
const assetUrls = new Set();
const seoUrls = new Set();
const fontUrls = new Set([
  "https://nikolas.vn/cdn/fonts/jost/jost_n4.d47a1b6347ce4a4c9f437608011273009d91f2b7.woff2",
  "https://nikolas.vn/cdn/fonts/jost/jost_n7.921dc18c13fa0b0c94c5e2517ffe06139c3615a3.woff2",
]);

function addUrl(candidate, bucket = assetUrls) {
  if (!candidate || typeof candidate !== "string") return;

  const matches = candidate.match(/https?:\/\/[^\s"')]+/g) ?? [];
  for (const match of matches) {
    const normalized = match.replace(/\\/g, "").replace(/[;,]$/, "");
    if (normalized.startsWith("http")) bucket.add(normalized);
  }
}

function addSrcset(srcset) {
  if (!srcset || typeof srcset !== "string") return;
  for (const entry of srcset.split(",")) {
    addUrl(entry.trim().split(/\s+/)[0]);
  }
}

for (const image of desktop.images ?? []) {
  addUrl(image.currentSrc || image.src);
}

for (const background of desktop.backgroundImages ?? []) {
  addUrl(background.backgroundImage);
}

for (const image of content.allAssets?.images ?? []) {
  addUrl(image.currentSrc || image.src);
  addSrcset(image.srcset);
  for (const source of image.sources ?? []) addSrcset(source.srcset);
}

for (const background of content.allAssets?.backgrounds ?? []) {
  addUrl(background);
}

for (const icon of content.allAssets?.favicons ?? []) {
  addUrl(icon.href, seoUrls);
}

for (const meta of desktop.meta ?? []) {
  if (["og:image", "twitter:image"].includes(meta.property || meta.name)) {
    addUrl(meta.content, seoUrls);
  }
}

await Promise.all([
  mkdir(imageDir, { recursive: true }),
  mkdir(seoDir, { recursive: true }),
  mkdir(fontDir, { recursive: true }),
]);

function safeName(urlString, fallback = "asset") {
  const url = new URL(urlString);
  const raw = decodeURIComponent(path.basename(url.pathname)) || fallback;
  const parsed = path.parse(raw);
  const base = (parsed.name || fallback)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80) || fallback;
  const extension = parsed.ext.toLowerCase().match(/^\.[a-z0-9]{2,5}$/)
    ? parsed.ext.toLowerCase()
    : ".webp";
  const digest = createHash("sha1").update(urlString).digest("hex").slice(0, 10);
  return `${base}-${digest}${extension}`;
}

async function download(url, directory, kind) {
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 Nikolas clone asset fetcher" },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }

  const fileName = safeName(url, kind);
  const filePath = path.join(directory, fileName);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(filePath, bytes);

  return {
    source: url,
    localPath: `/${path.relative(path.join(root, "public"), filePath).replaceAll("\\", "/")}`,
    bytes: bytes.length,
  };
}

async function runPool(items, directory, kind, concurrency = 4) {
  const queue = [...items];
  const completed = [];
  const failed = [];

  async function worker() {
    while (queue.length) {
      const url = queue.shift();
      if (!url) continue;

      try {
        completed.push(await download(url, directory, kind));
      } catch (error) {
        failed.push({
          source: url,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return { completed, failed };
}

const [images, seo, fonts] = await Promise.all([
  runPool([...assetUrls].sort(), imageDir, "image"),
  runPool([...seoUrls].sort(), seoDir, "seo"),
  runPool([...fontUrls].sort(), fontDir, "font"),
]);

const manifest = {
  generatedAt: new Date().toISOString(),
  source: "https://nikolas.vn/",
  images,
  seo,
  fonts,
  totals: {
    imageUrls: assetUrls.size,
    seoUrls: seoUrls.size,
    fontUrls: fontUrls.size,
    downloaded: images.completed.length + seo.completed.length + fonts.completed.length,
    failed: images.failed.length + seo.failed.length + fonts.failed.length,
  },
};

await writeFile(
  path.join(imageDir, "asset-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(JSON.stringify(manifest.totals, null, 2));

if (manifest.totals.failed > 0) {
  console.warn("Some assets failed to download. See asset-manifest.json for details.");
}
