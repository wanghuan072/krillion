import fs from "node:fs";
import { deploymentConfig as config, siteOrigin } from "./config.mjs";
import { assertManifest, changedUrls } from "./manifest.mjs";
import { trustedTrigger, readManifest, sameRelease, verifyPublished, submitBatches } from "./protocol.mjs";
import { restoreHistory, productionHistory, assertRecord, assertCurrentWorkflowRun } from "./github-state.mjs";
import { historyBoundary, reconcileProduction } from "./reconcile.mjs";

if (!process.argv.includes("--confirm")) {
  const manifest = assertManifest(JSON.parse(fs.readFileSync("out/seo-manifest.json", "utf8")), siteOrigin);
  const urls = changedUrls(null, manifest);
  console.log(JSON.stringify({ dryRun: true, message: "Local inspection only. Real submissions require a trusted successful production workflow.", urls }, null, 2));
} else {
  const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  if (process.env.GITHUB_ACTIONS !== "true" || !trustedTrigger(event, process.env.GITHUB_EVENT_NAME, process.env.GITHUB_REPOSITORY)) throw new Error("Real submissions require the trusted production workflow on main");
  await assertCurrentWorkflowRun();
  const published = await readManifest();
  const restored = await restoreHistory();
  const localRecord = assertRecord(JSON.parse(fs.readFileSync(".indexnow/current/record.json", "utf8")));
  const observations = [...restored.observations, localRecord];
  const checkpoint = restored.checkpoint;
  const coverageSince = historyBoundary(checkpoint, observations, published);
  if (!checkpoint) console.log(`No retained success checkpoint: submitting all active URLs and recoverable deletions. Historical coverage starts ${coverageSince}; versions before the first manifest cannot be reconstructed.`);
  const history = await productionHistory(coverageSince);
  const { manifest, urls, coveredDeployments } = await reconcileProduction({ published, checkpoint, observations, history });
  const assertCurrent = async () => {
    if (!sameRelease(published, await readManifest())) throw new Error("Public production was replaced while processing; retry the current version");
  };
  await assertCurrent();
  await verifyPublished(manifest, urls);
  await submitBatches(urls, { assertCurrent });
  // Written only after ALL batches and a final production identity check pass.
  const record = { schemaVersion: 1, kind: "notified", repository: config.repository, projectId: config.projectId, completedAt: new Date().toISOString(), coverageSince, coveredDeployments, manifest };
  fs.mkdirSync(".indexnow/notified", { recursive: true });
  fs.writeFileSync(".indexnow/notified/record.json", `${JSON.stringify(record, null, 2)}\n`);
  console.log(`IndexNow accepted ${urls.length} URLs. Checkpoint ready for durable upload; reception does not guarantee indexing.`);
}
