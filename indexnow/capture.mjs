import fs from "node:fs";
import { deploymentConfig as config, siteOrigin } from "./config.mjs";
import { trustedTrigger, readManifest } from "./protocol.mjs";
import { github, successfulDeployment, productionHistory, assertCurrentWorkflowRun } from "./github-state.mjs";

const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
if (!trustedTrigger(event, process.env.GITHUB_EVENT_NAME, process.env.GITHUB_REPOSITORY)) throw new Error("Not a trusted successful Krillion production event");
await assertCurrentWorkflowRun();
let current = null;
try { current = await readManifest(); } catch (error) { console.warn(error.message); }
let deployment;
if (process.env.GITHUB_EVENT_NAME === "deployment_status") {
  if (!Number.isSafeInteger(event.deployment.id)) throw new Error("Invalid deployment ID");
  deployment = await successfulDeployment(await github(`/deployments/${event.deployment.id}`));
} else {
  if (!current) throw new Error("Publish the manifest before manually retrying IndexNow");
  const history = await productionHistory(current.generatedAt);
  deployment = history.find((item) => item.host === current.release.deploymentHost && item.commit === current.release.commit);
}
if (!deployment) throw new Error("No trusted successful production deployment matches the published build");
let manifest = null;
let unavailable = null;
try {
  const candidate = current?.release.deploymentHost === deployment.host ? current : await readManifest(`https://${deployment.host}`);
  if (candidate.release.commit !== deployment.commit || candidate.release.deploymentHost !== deployment.host) throw new Error("Deployment identity and published manifest disagree");
  manifest = candidate;
} catch (error) { unavailable = error.message; }
const record = { schemaVersion: 1, kind: "observed", repository: config.repository, projectId: config.projectId, capturedAt: new Date().toISOString(), deployment, manifest, unavailable };
fs.mkdirSync(".indexnow/observed", { recursive: true });
fs.writeFileSync(".indexnow/observed/record.json", `${JSON.stringify(record, null, 2)}\n`);
if (!manifest) console.warn(`Snapshot unavailable for production deployment ${deployment.id}. The durable observation blocks incomplete notification until a matching snapshot is recovered.`);
else console.log(`Captured successful production ${deployment.id} at ${siteOrigin} (${manifest.entries.length} pages).`);
