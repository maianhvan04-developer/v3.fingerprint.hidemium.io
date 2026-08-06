/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const { chromium } = require("../.mcp-tools/playwright-mcp/node_modules/playwright-core");

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto("https://fingerprint.com/", {
    timeout: 90_000,
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(8_000);

  const trigger = page.getByText("See how this is calculated", { exact: true }).first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await page.waitForTimeout(1_200);

  const heading = page.getByText("How is this calculated?", { exact: true }).first();
  await heading.waitFor({ state: "visible" });
  const details = await heading.evaluate((element) => {
    const styleKeys = [
      "backgroundColor",
      "borderColor",
      "color",
      "display",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "gap",
      "gridTemplateColumns",
      "height",
      "lineHeight",
      "padding",
      "width",
    ];
    const styles = (node) => {
      const computed = getComputedStyle(node);
      return Object.fromEntries(styleKeys.map((key) => [key, computed[key]]));
    };
    const ancestors = [];
    let current = element;

    for (let depth = 0; current && depth < 8; depth += 1) {
      const rect = current.getBoundingClientRect();
      ancestors.push({
        className: current.className?.toString().slice(0, 240) ?? "",
        height: Math.round(rect.height),
        tag: current.tagName,
        text: current.textContent?.trim().replaceAll(/\s+/g, " ").slice(0, 900) ?? "",
        width: Math.round(rect.width),
      });
      current = current.parentElement;
    }

    const signalText = [
      "Bot detection",
      "Incognito detection",
      "VPN detection",
      "Tampering detection",
      "Virtual machine detection",
      "Developer tools detection",
      "Privacy-focused settings",
      "IP blocklist",
    ];
    const rows = signalText.map((label) => {
      const labelNode = Array.from(document.querySelectorAll("*")).find(
        (node) => node.children.length === 0 && node.textContent?.trim() === label,
      );
      const row = labelNode?.parentElement;
      return row ? {
        label,
        styles: styles(row),
        text: row.textContent?.trim().replaceAll(/\s+/g, " ") ?? "",
      } : { label, missing: true };
    });

    return { ancestors, headingStyles: styles(element), rows };
  });

  await page.screenshot({
    path: path.resolve(
      __dirname,
      "../docs/design-references/fingerprint.com/calculation-source.png",
    ),
  });
  console.log(JSON.stringify({ details, url: page.url() }, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
