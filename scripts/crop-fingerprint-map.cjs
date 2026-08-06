/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("../.mcp-tools/playwright-mcp/node_modules/playwright-core");

async function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const sourcePath = path.join(
    projectRoot,
    "docs/design-references/fingerprint.com/current-visit-map-source.png",
  );
  const outputPath = path.join(
    projectRoot,
    "public/images/fingerprint-demo/current-visit-map.png",
  );
  const source = fs.readFileSync(sourcePath).toString("base64");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 458, height: 163 } });

  await page.setContent(`
    <style>html,body{margin:0;background:#061425}img{display:block;width:458px;height:163px}</style>
    <img alt="" src="data:image/png;base64,${source}">
  `);
  await page.screenshot({
    clip: { x: 229, y: 0, width: 229, height: 84 },
    path: outputPath,
  });
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
