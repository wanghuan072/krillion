import { mergeObservations, changedUrls } from "./manifest.mjs";
import { readManifest, sameRelease } from "./protocol.mjs";

export function historyBoundary(checkpoint, observations, published) {
  return checkpoint?.coverageSince ?? observations.filter((item) => item.manifest).map((item) => item.manifest.generatedAt).sort()[0] ?? published.generatedAt;
}

export async function reconcileProduction({ published, checkpoint = null, observations, history, readSnapshot = readManifest }) {
  const coverageSince = historyBoundary(checkpoint, observations, published);
  const known = new Map(observations.filter((item) => item.manifest).map((item) => [item.deployment.host, item]));
  const covered = new Set(checkpoint?.coveredDeployments ?? []);
  const missing = new Set();
  const fresh = [];
  // Reconcile the timeline too: queued/skipped notifications must not hide an
  // intermediate successful production that added and then removed a URL.
  for (const deployment of [...history, ...observations.map((item) => item.deployment)]) {
    if (covered.has(deployment.id) || Date.parse(deployment.publishedAt) < Date.parse(coverageSince)) continue;
    let record = known.get(deployment.host);
    if (!record && published.release.deploymentHost === deployment.host && published.release.commit === deployment.commit) record = { deployment, manifest: published };
    if (!record) {
      try {
        const manifest = await readSnapshot(`https://${deployment.host}`);
        if (manifest.release.commit !== deployment.commit || manifest.release.deploymentHost !== deployment.host) throw new Error("Snapshot identity mismatch");
        record = { deployment, manifest };
      } catch { missing.add(deployment.id); continue; }
    }
    if (record.manifest.release.commit !== deployment.commit) throw new Error("Production observation has the wrong commit");
    fresh.push(record.manifest);
    covered.add(deployment.id);
    missing.delete(deployment.id);
  }
  if (missing.size) throw new Error(`Missing successful production snapshots (${[...missing].join(", ")}). Checkpoint unchanged; retry after recovering artifacts. Protected historical builds cannot be silently skipped.`);
  const currentDeployment = [...history, ...observations.map((item) => item.deployment)].some((item) => item.host === published.release.deploymentHost && item.commit === published.release.commit && covered.has(item.id));
  if (!currentDeployment) throw new Error("Current public release is absent from trusted production history");
  if (fresh.some((item) => Date.parse(item.generatedAt) > Date.parse(published.generatedAt))) throw new Error("Current site is older than an observed production; rebuild rollbacks before notification");
  if (checkpoint && Date.parse(checkpoint.manifest.generatedAt) > Date.parse(published.generatedAt)) throw new Error("Published rollback must be rebuilt before notification");
  if (checkpoint && Date.parse(checkpoint.manifest.generatedAt) === Date.parse(published.generatedAt) && !sameRelease(checkpoint.manifest, published) && checkpoint.manifest.release.deploymentHost !== published.release.deploymentHost) throw new Error("Ambiguous production release order");
  const manifest = mergeObservations(published, fresh, checkpoint?.manifest);
  return { manifest, urls: changedUrls(checkpoint?.manifest, manifest), coverageSince, coveredDeployments: [...covered].sort() };
}
