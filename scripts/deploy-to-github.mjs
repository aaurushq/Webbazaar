import fs from "fs";
import path from "path";

const OWNER = "aaurushq";
const REPO = "Webbazaar";
const TOKEN = process.argv[2] || process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error("Usage: node scripts/deploy-to-github.mjs <ghp_token>");
  process.exit(1);
}

const API_BASE = "https://api.github.com";

async function githubRequest(endpoint, method = "GET", body = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "WebBazaar-Deployer",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  };
  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GitHub API ${method} ${endpoint} failed (${res.status}): ${errorText}`);
  }
  return res.json();
}

function getAllFiles(dirPath, rootDir = dirPath) {
  let fileList = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");

    // Skip ignored directories and sensitive files
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git" ||
      entry.name === ".gemini" ||
      entry.name === ".user_uploaded" ||
      entry.name === ".env.local" ||
      (entry.name.startsWith(".env.") && entry.name.endsWith(".local"))
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      fileList = fileList.concat(getAllFiles(fullPath, rootDir));
    } else if (entry.isFile()) {
      fileList.push({ fullPath, relPath });
    }
  }

  return fileList;
}

async function deploy() {
  console.log(`=== SYNCING LATEST WEBBAZAAR UPDATES TO GITHUB: ${OWNER}/${REPO} ===`);

  // 1. Get latest commit SHA on main
  const refData = await githubRequest(`/repos/${OWNER}/${REPO}/git/ref/heads/main`);
  const latestCommitSha = refData.object.sha;
  console.log(`Current main commit: ${latestCommitSha}`);

  // 2. Collect project files
  const files = getAllFiles(process.cwd());
  console.log(`Found ${files.length} project files.`);

  // 3. Upload blobs in parallel batches
  console.log("Uploading file blobs to GitHub...");
  const treeItems = [];
  const BATCH_SIZE = 10;

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async ({ fullPath, relPath }) => {
      const content = fs.readFileSync(fullPath);
      const base64Content = content.toString("base64");
      const blob = await githubRequest(`/repos/${OWNER}/${REPO}/git/blobs`, "POST", {
        content: base64Content,
        encoding: "base64",
      });
      return {
        path: relPath,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      };
    });

    const batchResults = await Promise.all(promises);
    treeItems.push(...batchResults);
    process.stdout.write(`  Uploaded ${treeItems.length}/${files.length} files...\r`);
  }
  console.log(`\nAll ${treeItems.length} file blobs uploaded.`);

  // 4. Create Git Tree based on latest commit
  console.log("Creating Git Tree...");
  const tree = await githubRequest(`/repos/${OWNER}/${REPO}/git/trees`, "POST", {
    base_tree: latestCommitSha,
    tree: treeItems,
  });
  console.log(`Git Tree created: ${tree.sha}`);

  // 5. Create Commit
  console.log("Creating commit...");
  const commit = await githubRequest(`/repos/${OWNER}/${REPO}/git/commits`, "POST", {
    message: "feat: Add Resend transactional email utility and configure webbazaar.onrender.com domain",
    tree: tree.sha,
    parents: [latestCommitSha],
  });
  console.log(`Commit created: ${commit.sha}`);

  // 6. Update main ref
  console.log("Updating main branch reference...");
  await githubRequest(`/repos/${OWNER}/${REPO}/git/refs/heads/main`, "PATCH", {
    sha: commit.sha,
    force: true,
  });

  console.log("SUCCESS! Updates deployed to GitHub.");
}

deploy().catch((err) => {
  console.error("Deploy failed:", err.message);
  process.exit(1);
});
