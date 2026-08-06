/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("../.mcp-tools/playwright-mcp/node_modules/playwright-core");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "docs", "design-references", "local-qa");
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
];

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const report = [];

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        locale: "en-US",
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });

      await page.goto("http://localhost:3000", {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      await page.waitForSelector(".hero-console");
      await page.waitForTimeout(6_000);

      const hero = page.locator(".hero-console");
      await hero.screenshot({ path: path.join(outputDir, `hero-${viewport.name}.png`) });
      await page.screenshot({
        fullPage: true,
        path: path.join(outputDir, `page-${viewport.name}.png`),
      });

      const metrics = await hero.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const liveDemo = element.querySelector(".fingerprint-live-demo")?.getBoundingClientRect();
        return {
          hero: { width: Math.round(rect.width), height: Math.round(rect.height) },
          liveDemo: liveDemo ? { width: Math.round(liveDemo.width), height: Math.round(liveDemo.height) } : null,
          scrollWidth: element.scrollWidth,
        };
      });
      const interactions = {};
      if (viewport.name === "desktop") {
        await hero.getByRole("tab", { name: "Try trusted device" }).click();
        interactions.trustedScore = await hero.locator(".suspect-score__value").innerText();
        interactions.trustedCopy = await hero.locator(".suspect-score__headline").innerText();
        await hero.screenshot({ path: path.join(outputDir, "hero-desktop-trusted.png") });

        await hero.getByRole("tab", { name: "Your current device" }).click();
        await hero.getByRole("tab", { name: /Identification signals/ }).click();
        interactions.identificationCards = await hero.locator(".console-signal-card__title").allInnerTexts();
        await hero.screenshot({ path: path.join(outputDir, "hero-desktop-identification.png") });

        await hero.getByRole("tab", { name: /Browser smart signals/ }).click();
        interactions.browserCards = await hero.locator(".console-signal-card__title").allInnerTexts();
        await hero.screenshot({ path: path.join(outputDir, "hero-desktop-browser.png") });

        await hero.getByRole("tab", { name: /Live identity/ }).click();
        interactions.visitSummary = await hero.locator(".visit-summary__summary-value").first().innerText();
        const nextVisit = hero.getByRole("button", { name: "Next visit" });
        interactions.nextVisitEnabled = await nextVisit.isEnabled();
        if (interactions.nextVisitEnabled) {
          await nextVisit.click();
          interactions.olderVisitTime = await hero.locator(".visit-summary__visit-time").innerText();
        }
      } else {
        await hero.getByRole("tab", { name: /Identification signals/ }).click();
        interactions.mobileIdentificationCards = await hero.locator(".console-signal-card__title").allInnerTexts();
        await hero.screenshot({ path: path.join(outputDir, "hero-mobile-identification.png") });
        await hero.getByRole("tab", { name: /Live identity/ }).click();
        const compactScore = hero.locator(".suspect-score--compact");
        await compactScore.click();
        interactions.compactTrustedScore = await compactScore.locator(".suspect-score__compact-value").innerText();
      }

      report.push({ viewport, metrics, interactions, consoleErrors });
      await context.close();
    }
  } finally {
    await browser.close();
  }

  await fs.writeFile(
    path.join(outputDir, "report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
