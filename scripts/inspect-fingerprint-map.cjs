/* eslint-disable @typescript-eslint/no-require-imports */

const path = require("node:path");
const { chromium } = require("../.mcp-tools/playwright-mcp/node_modules/playwright-core");

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ locale: "en-US", viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const imageRequests = new Set();

  page.on("response", (response) => {
    if (response.request().resourceType() === "image") {
      const url = new URL(response.url());
      imageRequests.add(`${url.origin}${url.pathname}`);
    }
  });

  await page.goto("https://fingerprint.com/", { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForTimeout(7_000);

  const currentVisit = page.locator('[class*="VisitsHistorySection-module--currentVisit"]').first();
  const nodes = await currentVisit.evaluate((root) => [...root.querySelectorAll("*")].map((element) => {
    const rect = element.getBoundingClientRect();
    const computed = getComputedStyle(element);
    const image = element instanceof HTMLImageElement ? element.currentSrc || element.src : "";
    return {
      backgroundImage: computed.backgroundImage,
      classes: element.className?.toString() || "",
      styles: {
        borderRadius: computed.borderRadius,
        filter: computed.filter,
        objectFit: computed.objectFit,
        opacity: computed.opacity,
        overflow: computed.overflow,
        position: computed.position,
        transform: computed.transform,
      },
      image: image ? new URL(image).pathname : "",
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      tag: element.tagName.toLowerCase(),
      text: element.children.length === 0 ? element.textContent?.replace(/\s+/g, " ").trim() || "" : "",
    };
  }).filter((item) => item.rect.width > 0 && item.rect.height > 0));

  await currentVisit.screenshot({
    path: path.resolve(__dirname, "..", "docs", "design-references", "fingerprint.com", "current-visit-map-source.png"),
  });

  console.log(JSON.stringify({
    imageRequests: [...imageRequests].filter((url) => /map|tile|google|mapbox|osm|openstreet/i.test(url)),
    nodes: nodes.filter((node) => node.image
      || node.backgroundImage !== "none"
      || node.tag === "canvas"
      || node.tag === "iframe"
      || (node.rect.width >= 180 && node.rect.height >= 60)),
  }, null, 2));

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
