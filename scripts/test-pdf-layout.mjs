// Verifies the "Save All PDF" layout in HRApp.js by stubbing window.open and
// inspecting the HTML payload the app produces. Run with:
//   node scripts/test-pdf-layout.mjs
//
// Requires the dev server to be running at http://localhost:3000.

import { chromium } from "playwright";

const BASE = "http://localhost:3000";

const main = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("pageerror", (e) => console.error("[pageerror]", e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.error("[console]", msg.text());
  });

  // Capture the HTML the app pushes to window.open when "Save All" is clicked
  let capturedHtml = null;
  await page.exposeFunction("__capturePdfHtml", (html) => {
    capturedHtml = html;
  });
  await page.addInitScript(() => {
    const origOpen = window.open;
    window.open = (url, target, features) => {
      const w = {
        document: { write: (h) => window.__capturePdfHtml(h), close: () => {} },
        focus: () => {},
        print: () => {},
        addEventListener: () => {},
      };
      return w;
    };
  });

  await page.goto(BASE, { waitUntil: "networkidle" });

  // Log in as superadmin
  const superadmin = await page.locator("text=Super Admin").first();
  await superadmin.waitFor({ timeout: 10000 });
  await superadmin.click();

  // Enter PIN 000000 and submit (default superadmin PIN per seed)
  const pinInputs = page.locator("input[type='password']");
  await pinInputs.first().waitFor({ timeout: 5000 });
  for (let i = 0; i < 6; i++) {
    await pinInputs.nth(i).fill("0");
  }
  await page.locator("button:has-text('Masuk')").click();

  // Wait for the main app to load
  await page.waitForSelector("text=Payroll", { timeout: 10000 });
  await page.locator("text=Payroll").first().click();
  await page.waitForTimeout(500);

  // Click "Save All" button
  const saveAll = page.locator("button:has-text('Save All')");
  await saveAll.waitFor({ timeout: 5000 });
  await saveAll.click();
  await page.waitForTimeout(500);

  if (!capturedHtml) {
    console.error("FAIL: No PDF HTML captured");
    process.exit(1);
  }

  // Count slip cards and page elements
  const slipCount = (capturedHtml.match(/class="slip-card"/g) || []).length;
  const pageCount = (capturedHtml.match(/class="page"/g) || []).length;
  const gridCount = (capturedHtml.match(/class="slip-grid"/g) || []).length;
  const hasPageTitle = capturedHtml.includes("REKAPITULASI SLIP GAJI BULANAN");
  const hasGridCss = capturedHtml.includes("grid-template-columns: 1fr 1fr");
  const hasMmCss = capturedHtml.includes("padding: 6mm 8mm");

  console.log("slip cards:", slipCount);
  console.log("pages:", pageCount);
  console.log("grids:", gridCount);
  console.log("has page title:", hasPageTitle);
  console.log("has 2x2 grid CSS:", hasGridCss);
  console.log("has mm padding CSS:", hasMmCss);

  const ok = slipCount >= 1 && pageCount >= 1 && gridCount >= 1 && hasPageTitle && hasGridCss && hasMmCss;
  if (!ok) {
    console.error("FAIL: PDF layout checks did not pass");
    process.exit(1);
  }

  // Render a screenshot of the captured HTML to PNG for visual inspection
  await page.setContent(capturedHtml, { waitUntil: "load" });
  await page.screenshot({ path: "scripts/pdf-preview.png", fullPage: true });
  console.log("OK: wrote scripts/pdf-preview.png");

  await browser.close();
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
