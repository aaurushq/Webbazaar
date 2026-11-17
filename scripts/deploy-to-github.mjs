import fs from "fs";
import path from "path";

const OWNER = "aaurushq";
const REPO = "Webbazaar";
const TOKEN = process.argv[2] || process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error("Error: Please provide your GitHub Personal Access Token as an argument or via GITHUB_TOKEN environment variable.");
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
  console.log(`=== DEPLOYING WEBBAZAAR TO GITHUB REPO: ${OWNER}/${REPO} ===`);

  // 1. Verify token scopes
  const userRes = await githubRequest("/user");
  console.log(`Authenticated as GitHub user: @${userRes.login}`);

  // 2. Ensure repository exists and initialize if empty
  console.log("Checking repository status...");
  let latestCommitSha = null;
  try {
    const refData = await githubRequest(`/repos/${OWNER}/${REPO}/git/ref/heads/main`);
    latestCommitSha = refData.object.sha;
    console.log(`Repository already has main branch: ${latestCommitSha}`);
  } catch (e) {
    console.log("Repository is empty. Initializing with root README.md...");
    const initRes = await githubRequest(`/repos/${OWNER}/${REPO}/contents/README.md`, "PUT", {
      message: "Initial commit: Initialize WebBazaar repository",
      content: Buffer.from("# WebBazaar\n\nIndia-First Marketplace for Digital Assets\n").toString("base64"),
    });
    latestCommitSha = initRes.commit.sha;
    console.log(`Repository initialized. Base commit: ${latestCommitSha}`);
  }

  // 3. Collect project files
  const files = getAllFiles(process.cwd());
  console.log(`\nFound ${files.length} project files to deploy.`);

  // 4. Upload blobs in parallel batches
  console.log("\nUploading file blobs to GitHub...");
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
  console.log(`\n  All ${treeItems.length} file blobs uploaded successfully.`);

  // 5. Create Git Tree
  console.log("\nCreating Git Tree...");
  const tree = await githubRequest(`/repos/${OWNER}/${REPO}/git/trees`, "POST", {
    base_tree: latestCommitSha,
    tree: treeItems,
  });
  console.log(`  Git Tree created: ${tree.sha}`);

  // 6. Create Git Commit
  console.log("\nCreating deployment commit...");
  const commit = await githubRequest(`/repos/${OWNER}/${REPO}/git/commits`, "POST", {
    message: "WebBazaar: Complete Marketplace, Authentication, and Security Architecture (Phase 1 & 2)",
    tree: tree.sha,
    parents: [latestCommitSha],
  });
  console.log(`  Commit created: ${commit.sha}`);

  // 7. Update branch reference to new commit
  console.log("\nUpdating main branch reference...");
  await githubRequest(`/repos/${OWNER}/${REPO}/git/refs/heads/main`, "PATCH", {
    sha: commit.sha,
    force: true,
  });

  console.log("\n================================================================================");
  console.log(`SUCCESS! Project successfully deployed to: https://github.com/${OWNER}/${REPO}`);
  console.log("================================================================================");
}

deploy().catch((err) => {
  console.error("\nDeployment Failed:", err.message);
  process.exit(1);
});
