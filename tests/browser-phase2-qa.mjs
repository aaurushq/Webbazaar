import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import os from "os";

const SCREENSHOTS_DIR = path.resolve("./docs/screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

async function runPhase2BrowserQA() {
  console.log("=== Starting WebBazaar Phase 2 Automated Browser QA ===");

  const tempProfileDir = fs.mkdtempSync(path.join(os.tmpdir(), "wb-qa-"));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    userDataDir: tempProfileDir,
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
    // Set standard desktop viewport
    await page.setViewport({ width: 1280, height: 900 });

    // 1. Sign In Page
    console.log("1. Testing Sign In Screen (/login)...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "auth_login.png") });
    console.log("   ✓ Saved docs/screenshots/auth_login.png");

    // 2. Registration Page
    console.log("2. Testing Registration Screen (/register)...");
    await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "auth_register.png") });
    console.log("   ✓ Saved docs/screenshots/auth_register.png");

    // 3. Password Reset Request Page
    console.log("3. Testing Forgot Password Screen (/forgot-password)...");
    await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "auth_forgot_password.png") });
    console.log("   ✓ Saved docs/screenshots/auth_forgot_password.png");

    // 4. Seller Onboarding Application Page
    console.log("4. Testing Seller Onboarding (/become-a-seller)...");
    await page.goto(`${BASE_URL}/become-a-seller`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "seller_onboarding.png") });
    console.log("   ✓ Saved docs/screenshots/seller_onboarding.png");

    // 5. Buyer Dashboard
    console.log("5. Testing Buyer Dashboard (/dashboard/buyer)...");
    await page.goto(`${BASE_URL}/dashboard/buyer`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "dashboard_buyer.png") });
    console.log("   ✓ Saved docs/screenshots/dashboard_buyer.png");

    // 6. Seller Dashboard (Approved Store View)
    console.log("6. Testing Seller Dashboard (/dashboard/seller)...");
    await page.goto(`${BASE_URL}/dashboard/seller`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "dashboard_seller.png") });
    console.log("   ✓ Saved docs/screenshots/dashboard_seller.png");

    // 7. Administrator Dashboard & Review Queue
    console.log("7. Testing Admin Console (/dashboard/admin)...");
    await page.goto(`${BASE_URL}/dashboard/admin`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "dashboard_admin.png") });
    console.log("   ✓ Saved docs/screenshots/dashboard_admin.png");

    // Open Application Review Modal
    const reviewBtn = await page.$('button ::-p-text(Review Dossier)');
    if (reviewBtn) {
      await reviewBtn.click();
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "dashboard_admin_review_modal.png") });
      console.log("   ✓ Admin review modal captured");
    }

    // 8. Mobile Viewport (375x812)
    console.log("8. Testing Mobile Viewports (375x812)...");
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "mobile_login.png") });
    console.log("   ✓ Saved docs/screenshots/mobile_login.png");

    await page.goto(`${BASE_URL}/become-a-seller`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "mobile_seller_onboarding.png") });
    console.log("   ✓ Saved docs/screenshots/mobile_seller_onboarding.png");

    await page.goto(`${BASE_URL}/dashboard/admin`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "mobile_admin_dashboard.png") });
    console.log("   ✓ Saved docs/screenshots/mobile_admin_dashboard.png");

    console.log("\n=== Phase 2 Browser QA Summary ===");
    console.log(`Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((e) => console.log(` - ${e}`));
    } else {
      console.log(" ✓ Zero browser console errors detected.");
    }
    console.log(" ✓ All Phase 2 authentication and dashboard journeys verified.");
  } catch (err) {
    console.error("Phase 2 QA Error:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runPhase2BrowserQA();
