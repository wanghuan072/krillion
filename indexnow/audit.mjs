import fs from "node:fs";
import {
  indexNowEndpoint,
  indexNowKey,
  indexNowKeyFile,
  indexNowKeyLocation,
  siteHost,
  siteOrigin,
} from "./config.mjs";

const errors = [];
const keyPath = new URL(`../public/${indexNowKeyFile}`, import.meta.url);
const workflowPath = new URL("../.github/workflows/indexnow.yml", import.meta.url);

if (!/^[A-Za-z0-9-]{8,128}$/.test(indexNowKey)) {
  errors.push("The IndexNow key must contain 8–128 letters, numbers, or dashes.");
}
if (!fs.existsSync(keyPath) || fs.readFileSync(keyPath, "utf8").trim() !== indexNowKey) {
  errors.push(`public/${indexNowKeyFile} must contain the configured IndexNow key.`);
}
if (new URL(indexNowKeyLocation).origin !== siteOrigin || new URL(indexNowKeyLocation).pathname !== `/${indexNowKeyFile}`) {
  errors.push("The IndexNow key file must be located at the canonical site root.");
}
if (siteHost !== "krilliongames.com") {
  errors.push(`Unexpected IndexNow host: ${siteHost}`);
}
if (indexNowEndpoint !== "https://api.indexnow.org/indexnow") {
  errors.push("IndexNow submissions must use the shared official endpoint.");
}
if (!fs.existsSync(workflowPath)) {
  errors.push("Missing the IndexNow deployment workflow.");
} else {
  const workflow = fs.readFileSync(workflowPath, "utf8");
  for (const requiredText of ["deployment_status:", "workflow_dispatch:", "deployments: read", "previous-deployment.mjs", "npm run audit:indexnow", "--confirm"]) {
    if (!workflow.includes(requiredText)) errors.push(`IndexNow workflow is missing: ${requiredText}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`IndexNow audit passed for ${siteOrigin} with root key ${indexNowKeyFile}.`);
