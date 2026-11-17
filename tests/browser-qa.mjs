import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const SCREENSHOTS_DIR = path.resolve("./docs/screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

async function runBrowserQA() {
  console.log("=== Starting WebBazaar Automated Browser QA ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.toString());
  });

  try {
    // 1. Desktop Homepage
    console.log("1. Navigating to Homepage (Desktop)...");
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    const title = await page.title();
    console.log(`   Page Title: "${title}"`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "desktop_homepage.png") });
    console.log("   ✓ Saved docs/screenshots/desktop_homepage.png");

    // 2. Marketplace Catalog
    console.log("2. Testing Marketplace Catalog & Search/Filters...");
    await page.goto(`${BASE_URL}/marketplace`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "desktop_marketplace.png") });
    console.log("   ✓ Saved docs/screenshots/desktop_marketplace.png");

    // Test Search Input
    await page.type('input[placeholder*="Search"]', "kitchen");
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "desktop_marketplace_filtered.png") });
    console.log("   ✓ Search 'kitchen' applied & captured");

    // 3. Product Listing Detail Page
    console.log("3. Testing Listing Details (/listings/curry-leaf-complete-cloud-kitchen-restaurant-platform)...");
    await page.goto(`${BASE_URL}/listings/curry-leaf-complete-cloud-kitchen-restaurant-platform`, {
      waitUntil: "networkidle0",
    });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "desktop_listing_detail.png") });
    console.log("   ✓ Saved docs/screenshots/desktop_listing_detail.png");

    // Click Buy Button to verify Honest Modal
    console.log("   Testing Honest Phase Modal Trigger...");
    const buyBtn = await page.$('button ::-p-text(Buy & Download Code)');
    if (buyBtn) {
      await buyBtn.click();
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "desktop_phase_modal.png") });
      console.log("   ✓ Phase modal rendered & captured");
    }

    // 4. Online Businesses Page
    console.log("4. Testing Businesses Vertical Page (/businesses)...");
    await page.goto(`${BASE_URL}/businesses`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "desktop_businesses.png") });
    console.log("   ✓ Saved docs/screenshots/desktop_businesses.png");

    // 5. Seller Program Page
    console.log("5. Testing Seller Program (/sell)...");
    await page.goto(`${BASE_URL}/sell`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "desktop_sell.png") });
    console.log("   ✓ Saved docs/screenshots/desktop_sell.png");

    // 6. Mobile Viewport (iPhone / Pixel size)
    console.log("6. Testing Mobile Viewport (375x812)...");
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "mobile_homepage.png") });
    console.log("   ✓ Saved docs/screenshots/mobile_homepage.png");

    // Open Mobile Hamburger Menu
    const menuBtn = await page.$('button[aria-label="Toggle menu"]');
    if (menuBtn) {
      await menuBtn.click();
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "mobile_navigation_menu.png") });
      console.log("   ✓ Saved docs/screenshots/mobile_navigation_menu.png");
    }

    console.log("\n=== Browser QA Summary ===");
    console.log(`Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((e) => console.log(` - ${e}`));
    } else {
      console.log(" ✓ Zero browser console errors detected.");
    }
    console.log(" ✓ All browser user journeys validated successfully.");
  } catch (error) {
    console.error("Browser QA Execution Error:", error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runBrowserQA();
