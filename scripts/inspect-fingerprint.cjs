/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("../.mcp-tools/playwright-mcp/node_modules/playwright-core");

const rootDir = path.resolve(__dirname, "..");
const screenshotsDir = path.join(rootDir, "docs", "design-references", "fingerprint.com");
const researchPath = path.join(rootDir, "docs", "research", "fingerprint-demo-extraction.json");

const viewports = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

async function inspectViewport(browser, viewport) {
  const context = await browser.newContext({
    locale: "vi-VN",
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();
  const apiResponses = [];

  page.on("response", async (response) => {
    const resourceType = response.request().resourceType();
    const contentType = response.headers()["content-type"] || "";
    if (!["fetch", "xhr"].includes(resourceType) || !contentType.includes("json")) return;
    try {
      const parsedUrl = new URL(response.url());
      const payload = JSON.parse(await response.text());
      apiResponses.push({
        fields: payload && typeof payload === "object" ? Object.keys(payload).slice(0, 80) : [],
        path: `${parsedUrl.origin}${parsedUrl.pathname}`,
        status: response.status(),
      });
    } catch {
      // Some analytics responses are not readable after the page settles.
    }
  });

  await page.goto("https://fingerprint.com/", {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.waitForTimeout(7_000);

  await page.screenshot({
    fullPage: true,
    path: path.join(screenshotsDir, `home-${viewport.name}.png`),
  });

  const demoWrapper = page.locator('[class*="Demo-module--demoSectionsWrapper"]').first();
  if (await demoWrapper.count()) {
    await demoWrapper.screenshot({
      path: path.join(screenshotsDir, `demo-${viewport.name}.png`),
    });
  }

  const snapshot = await page.evaluate(() => {
    const styleProps = [
      "fontSize",
      "fontWeight",
      "fontFamily",
      "lineHeight",
      "letterSpacing",
      "color",
      "backgroundColor",
      "padding",
      "margin",
      "width",
      "height",
      "display",
      "gridTemplateColumns",
      "borderRadius",
      "border",
      "boxShadow",
      "overflow",
      "position",
      "gap",
    ];
    const keywords = /visitor|suspicious|incognito|browser|location|vpn|ip address|xin chào|khách truy cập|nghi ngờ|ẩn danh|trình duyệt|địa chỉ ip/i;
    const all = [...document.querySelectorAll("body *")];
    const candidates = all
      .filter((element) => {
        const text = element.textContent?.replace(/\s+/g, " ").trim() || "";
        return text.length > 0 && text.length <= 700 && keywords.test(text);
      })
      .map((element) => {
        const computed = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const styles = {};
        for (const property of styleProps) styles[property] = computed[property];
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id,
          classes: element.className?.toString().slice(0, 400) || "",
          text: element.textContent?.replace(/\s+/g, " ").trim() || "",
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y + scrollY),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          styles,
        };
      })
      .filter((item) => item.rect.width > 0 && item.rect.height > 0)
      .slice(0, 300);

    const demoWrapper = document.querySelector('[class*="Demo-module--demoSectionsWrapper"]');
    const demoAncestors = [];
    let ancestor = demoWrapper;
    while (ancestor && demoAncestors.length < 7) {
      const rect = ancestor.getBoundingClientRect();
      const computed = getComputedStyle(ancestor);
      demoAncestors.push({
        tag: ancestor.tagName.toLowerCase(),
        id: ancestor.id,
        classes: ancestor.className?.toString() || "",
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y + scrollY),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        styles: Object.fromEntries(styleProps.map((property) => [property, computed[property]])),
      });
      ancestor = ancestor.parentElement;
    }

    function serializeDemo(element, depth = 0) {
      if (!element || depth > 7) return null;
      const computed = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const children = [...element.children];
      return {
        tag: element.tagName.toLowerCase(),
        id: element.id,
        classes: element.className?.toString() || "",
        text: children.length === 0 ? element.textContent?.replace(/\s+/g, " ").trim() || "" : "",
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y + scrollY),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        styles: Object.fromEntries(styleProps.map((property) => [property, computed[property]])),
        svg: element.tagName === "svg" ? element.outerHTML.slice(0, 20_000) : "",
        children: children.slice(0, 40).map((child) => serializeDemo(child, depth + 1)).filter(Boolean),
      };
    }

    return {
      title: document.title,
      url: location.href,
      lang: document.documentElement.lang,
      bodyText: document.body.innerText.slice(0, 30_000),
      headings: [...document.querySelectorAll("h1,h2,h3,h4")].map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: element.textContent?.replace(/\s+/g, " ").trim() || "",
      })),
      candidates,
      demoAncestors,
      demoTree: serializeDemo(demoWrapper),
    };
  });

  const interactions = {};
  if (viewport.name === "desktop") {
    const trustedDevice = page.getByText("Try trusted device", { exact: true }).first();
    if (await trustedDevice.count()) {
      interactions.trustedDeviceBefore = await demoWrapper.innerText();
      interactions.trustedDeviceStyle = await trustedDevice.evaluate((element) => {
        const computed = getComputedStyle(element);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          cursor: computed.cursor,
          textDecoration: computed.textDecoration,
        };
      });
      await trustedDevice.hover();
      interactions.trustedDeviceHoverStyle = await trustedDevice.evaluate((element) => {
        const computed = getComputedStyle(element);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          textDecoration: computed.textDecoration,
        };
      });
      await trustedDevice.click();
      await page.waitForTimeout(900);
      interactions.trustedDeviceAfter = await demoWrapper.innerText();
      await demoWrapper.screenshot({
        path: path.join(screenshotsDir, "demo-desktop-trusted-device.png"),
      });
    }
  }

  await context.close();
  return { viewport, ...snapshot, apiResponses, interactions };
}

async function main() {
  await fs.mkdir(screenshotsDir, { recursive: true });
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--no-sandbox"],
  });

  try {
    const results = [];
    for (const viewport of viewports) {
      results.push(await inspectViewport(browser, viewport));
    }
    await fs.writeFile(researchPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");
    console.log(`Saved ${results.length} viewport snapshots to ${screenshotsDir}`);
    console.log(`Saved DOM extraction to ${researchPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
