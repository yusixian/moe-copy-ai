#!/usr/bin/env node
/**
 * Post-build script for Firefox extension
 * Adds browser_specific_settings to manifest.json
 */

const fs = require("node:fs")
const path = require("node:path")

const FIREFOX_BUILD_DIR = path.join(
  __dirname,
  "..",
  "build",
  "firefox-mv3-prod"
)
const MANIFEST_PATH = path.join(FIREFOX_BUILD_DIR, "manifest.json")

// Your extension ID (must not be changed after first submission)
// Format: something@yourdomain.com or {uuid}
const EXTENSION_ID = "moe-copy-ai@cosine.ren"

try {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Manifest file not found at ${MANIFEST_PATH}`)
    process.exit(1)
  }

  // Read manifest
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))

  // Add browser_specific_settings
  manifest.browser_specific_settings = {
    gecko: {
      id: EXTENSION_ID,
      strict_min_version: "109.0",
      data_collection_permissions: {
        required: [
          "websiteContent", // 提取网页文本、标题等内容
          "browsingActivity" // 提取网页 URL 信息
        ]
      }
    }
  }

  // Write back with pretty formatting
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))

  console.log(
    "✅ Successfully added browser_specific_settings to Firefox manifest"
  )
  console.log(`   Extension ID: ${EXTENSION_ID}`)
} catch (error) {
  console.error("❌ Error updating Firefox manifest:", error)
  process.exit(1)
}
