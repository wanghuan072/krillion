import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { deploymentConfig as config } from "./config.mjs";
import { productionManifest, deploymentHost } from "./protocol.mjs";

const base = `https://api.github.com/repos/${config.repository}`;
export function trustedWorkflowRun(run) {
  return run?.path === config.workflow && run.head_branch === config.branch && run.repository?.full_name === config.repository && ["deployment_status", "workflow_dispatch"].includes(run.event);
}

export async function assertCurrentWorkflowRun() {
  if (process.env.GITHUB_ACTIONS !== "true" || !/^\d+$/.test(process.env.GITHUB_RUN_ID ?? "")) throw new Error("A trusted Actions run is required");
  const run = await github(`/actions/runs/${process.env.GITHUB_RUN_ID}`);
  if (!trustedWorkflowRun(run) || run.event !== process.env.GITHUB_EVENT_NAME) throw new Error("Workflow identity is not Krillion production main");
}
export async function github(route) {
  if (!process.env.GITHUB_TOKEN) throw new Error("GitHub Actions built-in token is required");
  const response = await fetch(`${base}${route}`, { redirect: "error", headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`GitHub state unavailable: ${response.status} ${route}`);
  return response.json();
}

export async function successfulDeployment(deployment) {
  if (deployment.creator?.login !== "vercel[bot]" || !/^production$/i.test(deployment.environment ?? "")) return null;
  const statuses = await github(`/deployments/${deployment.id}/statuses?per_page=100`);
  // A later inactive status is normal when Vercel replaces a successful deployment.
  const success = statuses.find((item) => item.state === "success" && item.creator?.login === "vercel[bot]");
  if (!success && statuses.length === 100) throw new Error("Deployment status history exceeds the bounded audit window");
  if (!success) return null;
  const host = deploymentHost(success.environment_url);
  return { id: String(deployment.id), commit: deployment.sha, host, publishedAt: success.created_at };
}

export async function productionHistory(since) {
  const result = [];
  const cutoff = since ? Date.parse(since) - 86400000 : 0;
  for (let page = 1; page <= 50; page++) {
    const deployments = await github(`/deployments?per_page=100&page=${page}`);
    for (const deployment of deployments) {
      if (since && Date.parse(deployment.created_at) < cutoff) continue;
      const record = await successfulDeployment(deployment);
      if (record && (!since || Date.parse(record.publishedAt) >= Date.parse(since))) result.push(record);
    }
    if (deployments.length < 100 || (since && deployments.every((entry) => Date.parse(entry.created_at) < cutoff))) return result;
  }
  throw new Error("Production history exceeds the bounded audit window; refusing incomplete history");
}

export function assertRecord(record) {
  if (record?.schemaVersion !== 1 || record.repository !== config.repository || record.projectId !== config.projectId || !["observed", "notified"].includes(record.kind)) throw new Error("Invalid IndexNow history identity");
  if (record.manifest) productionManifest(record.manifest);
  if (record.kind === "observed") {
    const deployment = record.deployment;
    if (!/^\d+$/.test(deployment?.id ?? "") || !/^[a-f0-9]{40}$/.test(deployment.commit ?? "") || !Number.isFinite(Date.parse(deployment.publishedAt))) throw new Error("Invalid observed deployment identity");
    deploymentHost(`https://${deployment.host}`);
    if (record.manifest && (record.manifest.release.commit !== deployment.commit || record.manifest.release.deploymentHost !== deployment.host)) throw new Error("Observed manifest differs from its deployment");
  }
  if (record.kind === "notified" && (!record.manifest || !record.completedAt || !Array.isArray(record.coveredDeployments) || !record.coverageSince)) throw new Error("Invalid notification checkpoint");
  return record;
}

async function downloadArtifact(id) {
  const response = await fetch(`${base}/actions/artifacts/${id}/zip`, { redirect: "manual", headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(20000) });
  if (response.status !== 302) throw new Error(`Cannot download IndexNow artifact: ${response.status}`);
  const location = new URL(response.headers.get("location"));
  if (location.protocol !== "https:" || location.username || location.password) throw new Error("Invalid GitHub artifact download location");
  // The signed storage URL receives no GitHub token. Never extract arbitrary paths from the archive.
  const archive = await fetch(location, { redirect: "error", signal: AbortSignal.timeout(30000) });
  if (!archive.ok) throw new Error(`Cannot read IndexNow artifact: ${archive.status}`);
  const bytes = Buffer.from(await archive.arrayBuffer());
  if (bytes.length > 20_000_000) throw new Error("IndexNow artifact too large");
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "krillion-indexnow-"));
  const file = path.join(directory, "state.zip");
  try {
    fs.writeFileSync(file, bytes);
    const script = "import sys,zipfile\nz=zipfile.ZipFile(sys.argv[1])\ni=z.getinfo('record.json')\nassert i.file_size < 20000000\nsys.stdout.buffer.write(z.read(i))";
    return assertRecord(JSON.parse(execFileSync("python3", ["-c", script, file], { encoding: "utf8", maxBuffer: 20_000_000 })));
  } finally { fs.rmSync(file, { force: true }); fs.rmdirSync(directory); }
}

export async function restoreHistory({ api = github, download = downloadArtifact } = {}) {
  const records = [];
  const runs = new Map();
  for (let page = 1; page <= 50; page++) {
    const data = await api(`/actions/artifacts?per_page=100&page=${page}`);
    for (const artifact of data.artifacts) {
      const isCheckpoint = artifact.name.startsWith(config.checkpointPrefix);
      if ((!isCheckpoint && !artifact.name.startsWith(config.observationPrefix)) || artifact.expired) continue;
      const runId = artifact.workflow_run?.id;
      if (!runId) throw new Error("IndexNow artifact has no workflow identity");
      if (!runs.has(runId)) runs.set(runId, await api(`/actions/runs/${runId}`));
      const run = runs.get(runId);
      if (!trustedWorkflowRun(run)) continue;
      if (isCheckpoint && run.conclusion !== "success") continue;
      const record = assertRecord(await download(artifact.id));
      if ((record.kind === "notified") !== isCheckpoint) throw new Error("Artifact kind differs from its name");
      records.push(record);
    }
    if (data.artifacts.length < 100) {
      const checkpoints = records.filter((record) => record.kind === "notified").sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
      return { checkpoint: checkpoints[0] ?? null, observations: records.filter((record) => record.kind === "observed") };
    }
  }
  throw new Error("Artifact history exceeds the bounded audit window; refusing partial restoration");
}
