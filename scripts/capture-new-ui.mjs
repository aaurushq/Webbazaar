import puppeteer from "puppeteer-core";
import path from "path";
import os from "os";
import fs from "fs";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactDir = "C:\\Users\\CHETAN PRAJAPAT\\.gemini\\antigravity\\brain\\c94ebf3a-9dfb-45ce-8e86-1004bdf8218f";

async function run() {
  const tempProfile = path.join(os.tmpdir(), "puppeteer-ui-" + Date.now());
  fs.mkdirSync(tempProfile, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new",
    userDataDir: tempProfile,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  
  // 1. Homepage
  console.log("Navigating to Homepage...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, "revamped_homepage_hero.png") });
  console.log("Captured revamped_homepage_hero.png");

  // 2. Marketplace
  console.log("Navigating to Marketplace...");
  await page.goto("http://localhost:3000/marketplace", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, "revamped_marketplace_catalog.png") });
  console.log("Captured revamped_marketplace_catalog.png");

  await browser.close();
  try {
    fs.rmSync(tempProfile, { recursive: true, force: true });
  } catch (e) {}
  console.log("Screenshots captured successfully!");
}

run().catch((e) => {
  console.error("Error capturing:", e);
  process.exit(1);
});
