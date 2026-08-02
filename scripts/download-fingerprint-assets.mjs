import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const sourcePath = path.join(projectRoot, "docs", "research", "live-global-extraction.json");
const outputRoot = path.join(projectRoot, "public", "images", "source");
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const urls = [
  ...(source.images ?? []).map((image) => image.src),
  ...(source.videos ?? []).flatMap((video) => [video.src, video.poster]),
  ...(source.favicons ?? []).map((favicon) => favicon.href),
].filter((value) => typeof value === "string" && /^https?:\/\//.test(value));

await mkdir(outputRoot, { recursive: true });

const queue = [...new Set(urls)];
const downloaded = [];

async function worker() {
  while (queue.length) {
    const url = queue.shift();
    if (!url) return;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const pathname = new URL(url).pathname;
      const baseName = path.basename(pathname) || `asset-${downloaded.length + 1}`;
      const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, "-");
      const filePath = path.join(outputRoot, safeName);
      await writeFile(filePath, Buffer.from(await response.arrayBuffer()));
      downloaded.push({ source: url, path: path.relative(projectRoot, filePath) });
    } catch (error) {
      downloaded.push({ source: url, error: error instanceof Error ? error.message : "Unknown error" });
    }
  }
}

await Promise.all(Array.from({ length: Math.min(4, Math.max(1, queue.length)) }, worker));
await writeFile(
  path.join(outputRoot, "manifest.json"),
  `${JSON.stringify({ discovered: urls.length, downloaded }, null, 2)}\n`,
);

console.log(`Asset discovery complete: ${urls.length} remote assets found.`);
