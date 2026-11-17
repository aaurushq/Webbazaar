import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactDir = "C:\\Users\\CHETAN PRAJAPAT\\.gemini\\antigravity\\brain\\c94ebf3a-9dfb-45ce-8e86-1004bdf8218f";

const sellerEmail = "qa_verified_user@webbazaar.in";
const sellerPass = "TestPassword123!";

const adminEmail = "chetan500prajapat@gmail.com";
const adminPass = "ChetanPass123!@#";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log("Launching headless Chrome from:", chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  // 1. Marketplace with real items
  console.log("Capturing Public Marketplace...");
  await page.goto("http://localhost:3000/marketplace", { waitUntil: "networkidle2" });
  await sleep(1500);
  await page.screenshot({ path: path.join(artifactDir, "phase3_marketplace_catalog.png") });
  console.log("Saved phase3_marketplace_catalog.png");

  // 2. Login as Verified Seller
  console.log("Logging in as Verified Seller...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
  await page.type('input[type="email"]', sellerEmail);
  await page.type('input[type="password"]', sellerPass);
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});
  await sleep(2000);

  // 3. Seller Listings Dashboard
  console.log("Capturing Seller Listings Dashboard...");
  await page.goto("http://localhost:3000/dashboard/seller/listings", { waitUntil: "networkidle2" });
  await sleep(2500);
  await page.screenshot({ path: path.join(artifactDir, "phase3_seller_listings_dashboard.png") });
  console.log("Saved phase3_seller_listings_dashboard.png");

  // 4. Listing Creation Wizard
  console.log("Capturing Listing Creation Wizard...");
  await page.goto("http://localhost:3000/dashboard/seller/listings/new", { waitUntil: "networkidle2" });
  await sleep(2000);
  await page.screenshot({ path: path.join(artifactDir, "phase3_listing_wizard_step1.png") });
  console.log("Saved phase3_listing_wizard_step1.png");

  // Click continue to step 2
  const continueButtons = await page.$$("button");
  for (const btn of continueButtons) {
    const text = await (await btn.getProperty("textContent")).jsonValue();
    if (text && text.includes("Continue")) {
      await btn.click();
      break;
    }
  }
  await sleep(1000);
  await page.screenshot({ path: path.join(artifactDir, "phase3_listing_wizard_step2.png") });
  console.log("Saved phase3_listing_wizard_step2.png");

  // 5. Logout & Login as Admin
  console.log("Logging in as Admin...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
  await page.evaluate(() => localStorage.clear());
  // Clear cookies
  const client = await page.target().createCDPSession();
  await client.send("Network.clearBrowserCookies");

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
  await page.type('input[type="email"]', adminEmail);
  await page.type('input[type="password"]', adminPass);
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});
  await sleep(2000);

  // 6. Admin Listings Moderation Queue
  console.log("Capturing Admin Listings Moderation Queue...");
  await page.goto("http://localhost:3000/dashboard/admin/listings", { waitUntil: "networkidle2" });
  await sleep(2500);
  await page.screenshot({ path: path.join(artifactDir, "phase3_admin_moderation_queue.png") });
  console.log("Saved phase3_admin_moderation_queue.png");

  await browser.close();
  console.log("All screenshots captured successfully!");
}

capture().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
