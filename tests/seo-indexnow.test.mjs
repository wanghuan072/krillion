import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { renderedContent, fingerprint, fingerprintVersion, contentDate } from "../seo/rendered-content.mjs";
import { assertManifest, changedUrls, mergeObservations } from "../indexnow/manifest.mjs";
import { trustedTrigger, deploymentHost, productionManifest, verifyPublished, submitBatches, sameRelease } from "../indexnow/protocol.mjs";
import { reconcileProduction } from "../indexnow/reconcile.mjs";
import { assertRecord, trustedWorkflowRun, restoreHistory } from "../indexnow/github-state.mjs";
import { prepareSiteState, stateRoutes } from "../seo/site-registry.mjs";
import { deploymentConfig as config, siteOrigin as origin, indexNowKey, indexNowKeyLocation } from "../indexnow/config.mjs";

const time = (n) => `2026-10-21T0${n}:00:00.000Z`;
const html = (route = "/", body = "Answer") => `<html><head><title>Krillion</title><link rel="canonical" href="${origin}${route}"/><meta name="description" content="Daily answers"/></head><body><h1>${body}</h1><a href="/guides">Guides</a><img src="/images/logo.png" alt="Krillion"/><footer>© 2026 Krillion</footer></body></html>`;
function manifest(n, paths = ["/"], deletedAt = {}) {
  const entries = paths.map((route) => ({ path: route, canonicalUrl: `${origin}${route}`, indexable: true, contentFingerprint: `sha256:${fingerprint(route)}`, htmlFingerprint: `sha256:${renderedContent(html(route)).fingerprint}`, lastModified: time(0) })).sort((a, b) => a.canonicalUrl < b.canonicalUrl ? -1 : 1);
  return { schemaVersion: 1, fingerprintVersion, siteUrl: origin, generatedAt: time(n), entries, deletedAt, deletedUrls: Object.keys(deletedAt).sort(), contentVersion: fingerprint({ entries, deletedAt }), release: { environment: "production", projectId: config.projectId, repository: config.repository, branch: config.branch, commit: String(n).repeat(40), deploymentHost: `krillion-build${n}${config.deploymentSuffix}` } };
}
const deployment = (m, id) => ({ id: String(id), commit: m.release.commit, host: m.release.deploymentHost, publishedAt: m.generatedAt });
const observation = (m, id) => ({ schemaVersion: 1, kind: "observed", repository: config.repository, projectId: config.projectId, manifest: m, deployment: deployment(m, id) });
const checkpoint = (m, ids) => ({ schemaVersion: 1, kind: "notified", repository: config.repository, projectId: config.projectId, manifest: m, coveredDeployments: ids.map(String), completedAt: m.generatedAt, coverageSince: time(0) });

test("rendered fingerprints ignore CSS, comments, build scripts, source formatting and copyright years", () => {
  const first = html();
  const decorated = first.replace("<body>", '<body class="new-theme"><style>h1{color:red}</style><!-- source note --><script>window.build="new-id"</script>').replace("</h1>", "</h1>\n  ").replace("© 2026", "© 2027");
  assert.equal(renderedContent(first).fingerprint, renderedContent(decorated).fingerprint);
});
test("copy, TDK, H levels, links, images, video and indexing changes alter fingerprints", () => {
  const first = html();
  const changes = [first.replace("Answer", "Verified answer"), first.replace("Daily answers", "Updated description"), first.replaceAll("h1", "h2"), first.replace('href="/guides"', 'href="/games"'), first.replace('alt="Krillion"', 'alt="Krillion games"'), first.replace("</body>", '<iframe src="https://www.youtube.com/embed/example"></iframe></body>'), first.replace("</head>", '<meta name="robots" content="noindex"/></head>')];
  for (const change of changes) assert.notEqual(renderedContent(change).fingerprint, renderedContent(first).fingerprint);
  assert.notEqual(renderedContent(first, { imageHash: () => "before" }).fingerprint, renderedContent(first, { imageHash: () => "after" }).fingerprint);
});
test("unchanged pages and the initial fingerprint migration retain dates; new and changed pages advance", () => {
  const old = { fingerprint: "same", lastModified: time(0) };
  assert.equal(contentDate({ hash: "same", old, now: time(2) }), time(0));
  assert.equal(contentDate({ hash: "new", local: old, migrating: true, now: time(2) }), time(0));
  assert.equal(contentDate({ hash: "new", local: { ...old, awaitingRender: true }, migrating: true, now: time(2) }), time(2));
  assert.equal(contentDate({ hash: "new", local: old, now: time(2) }), time(2));
  assert.equal(contentDate({ hash: "new", old, local: { fingerprint: "new", lastModified: time(0) }, now: time(2) }), time(2));
});
test("registry discovers static routes and reflects removed or renamed source records", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "krillion-seo-test-"));
  try {
    for (const directory of ["app/(info)/new-page", "app/games/[slug]", "data/games", "data/guides", "data/answers"]) fs.mkdirSync(path.join(root, directory), { recursive: true });
    fs.writeFileSync(path.join(root, "app/page.tsx"), "export default null");
    fs.writeFileSync(path.join(root, "app/(info)/new-page/page.tsx"), "export default null");
    fs.writeFileSync(path.join(root, "data/games/games.json"), JSON.stringify([{ id: "one", slug: "renamed", status: "published" }, { id: "draft", slug: "draft", status: "draft" }]));
    const previous = { staticPages: { "/": { fingerprint: "a", lastModified: time(0) }, "/removed": { fingerprint: "b", lastModified: time(0) } }, games: { one: { slug: "old", fingerprint: "c", lastModified: time(0) } } };
    const next = prepareSiteState(previous, { root, now: time(2) });
    assert.deepEqual(stateRoutes(next).map((item) => item.path), ["/", "/new-page", "/games/renamed"]);
    assert.equal(next.staticPages["/"].lastModified, time(0));
    assert.equal(next.staticPages["/new-page"].awaitingRender, true);
    assert.deepEqual(next.deletedAt, { "/removed": time(2), "/games/old": time(2) });
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
test("new, edited, removed, noindex, restored and renamed canonicals produce the right changes", () => {
  const a = manifest(1, ["/", "/old"]);
  const b = manifest(2, ["/", "/new"], { [`${origin}/old`]: time(2) });
  b.entries.find((item) => item.path === "/").contentFingerprint = `sha256:${fingerprint("edit")}`;
  assert.deepEqual(changedUrls(a, b), [`${origin}/`, `${origin}/new`, `${origin}/old`]);
  const hidden = manifest(3, ["/"]);
  hidden.entries[0].indexable = false;
  assert.deepEqual(changedUrls(a, hidden), [`${origin}/`, `${origin}/old`]);
  assert.deepEqual(changedUrls(hidden, manifest(4)), [`${origin}/`]);
  assert.throws(() => changedUrls(b, a), /predates/);
  assert.throws(() => assertManifest({ ...a, entries: [...a.entries, a.entries[0]] }, origin), /Invalid/);
});
test("unacknowledged middle production preserves pages added and deleted between notifications", async () => {
  const a = manifest(1);
  const b = manifest(2, ["/", "/temporary"]);
  const c = manifest(3);
  const result = await reconcileProduction({ published: c, checkpoint: checkpoint(a, [1]), observations: [observation(b, 2), observation(c, 3)], history: [deployment(a, 1), deployment(b, 2), deployment(c, 3)] });
  assert.deepEqual(result.urls, [`${origin}/temporary`]);
  assert.equal(result.manifest.deletedAt[`${origin}/temporary`], time(3));
  assertRecord(checkpoint(result.manifest, [1, 2, 3]));
  const retry = await reconcileProduction({ published: c, checkpoint: checkpoint(result.manifest, [1, 2, 3]), observations: [observation(c, 3)], history: [deployment(c, 3)] });
  assert.deepEqual(retry.urls, []);
});
test("restoration clears old deletion events; another deletion gets a new event version", () => {
  const url = `${origin}/again`;
  const old = manifest(1, ["/"], { [url]: time(1) });
  const restored = manifest(2, ["/", "/again"]);
  const restoredMerged = mergeObservations(restored, [], old);
  assert.equal(restoredMerged.deletedAt[url], undefined);
  const removedAgain = mergeObservations(manifest(4), [restored], old);
  assert.equal(removedAgain.deletedAt[url], time(4));
  assert.deepEqual(changedUrls(old, removedAgain), [url]);
  const staleLedger = manifest(5, ["/"], { [url]: time(1) });
  assert.equal(mergeObservations(staleLedger, [], removedAgain).deletedAt[url], time(4));
});
test("missing protected intermediate versions block checkpoints; recovered snapshots unblock them", async () => {
  const a = manifest(1), b = manifest(2, ["/", "/brief"]), c = manifest(3);
  const input = { published: c, checkpoint: checkpoint(a, [1]), observations: [observation(c, 3)], history: [deployment(b, 2), deployment(c, 3)] };
  await assert.rejects(reconcileProduction({ ...input, readSnapshot: async () => { throw new Error("401"); } }), /Missing successful production snapshots/);
  const recovered = await reconcileProduction({ ...input, readSnapshot: async () => b });
  assert.deepEqual(recovered.urls, [`${origin}/brief`]);
});
test("expired checkpoints trigger a full resubmission without resetting page dates", async () => {
  const a = manifest(1, ["/", "/gone"]), b = manifest(2);
  const result = await reconcileProduction({ published: b, observations: [observation(a, 1), observation(b, 2)], history: [deployment(a, 1), deployment(b, 2)] });
  assert.deepEqual(result.urls, [`${origin}/`, `${origin}/gone`]);
  assert.equal(result.manifest.entries[0].lastModified, time(0));
});
test("artifact restoration keeps failed-run observations, ignores failed/expired/foreign checkpoints and selects newest success", async () => {
  const a = manifest(1), b = manifest(2), c = manifest(3);
  const records = new Map([[1, checkpoint(a, [1])], [2, checkpoint(c, [1, 2, 3])], [3, observation(b, 2)], [4, checkpoint(c, [1, 2, 3])], [5, checkpoint(b, [1, 2])]]);
  const artifacts = [1, 2, 3, 4, 5, 6].map((id) => ({ id, name: `${id === 3 ? config.observationPrefix : config.checkpointPrefix}${id}`, expired: id === 6, workflow_run: { id } }));
  const calls = [];
  const api = async (route) => {
    if (route.startsWith("/actions/artifacts?")) return { artifacts };
    const id = Number(route.split("/").at(-1));
    return { path: config.workflow, head_branch: id === 4 ? "preview" : config.branch, repository: { full_name: config.repository }, event: "deployment_status", conclusion: [2, 3].includes(id) ? "failure" : "success" };
  };
  const restored = await restoreHistory({ api, download: async (id) => { calls.push(id); return records.get(id); } });
  assert.deepEqual(calls, [1, 3, 5]);
  assert.equal(restored.checkpoint.manifest.generatedAt, b.generatedAt);
  assert.equal(restored.observations[0].deployment.id, "2");
});
test("Preview, failed, foreign and payload-spoofed events fail the gate", () => {
  const event = { repository: { full_name: config.repository }, sender: { login: "vercel[bot]" }, deployment: { creator: { login: "vercel[bot]" }, environment: "Production" }, deployment_status: { state: "success" } };
  assert.equal(trustedTrigger(event, "deployment_status", config.repository), true);
  for (const modify of [(x) => x.sender.login = "someone", (x) => x.deployment.environment = "Preview", (x) => x.deployment_status.state = "failure", (x) => x.repository.full_name = "elsewhere/repo"]) {
    const copy = structuredClone(event); modify(copy);
    assert.equal(trustedTrigger(copy, "deployment_status", config.repository), false);
  }
  assert.equal(trustedTrigger(event, "repository_dispatch", config.repository), false);
  for (const url of ["https://evil.com", "https://krillion-fake-whs-projects-f97a952d.vercel.app.evil.com", "https://user:pass@krillion-build1-whs-projects-f97a952d.vercel.app", "http://krillion-build1-whs-projects-f97a952d.vercel.app"]) assert.throws(() => deploymentHost(url));
  const wrong = manifest(1); wrong.release.projectId = "another-project";
  assert.throws(() => productionManifest(wrong), /verified Krillion/);
  const run = { path: config.workflow, head_branch: config.branch, repository: { full_name: config.repository }, event: "deployment_status" };
  assert.equal(trustedWorkflowRun(run), true);
  assert.equal(trustedWorkflowRun({ ...run, head_branch: "preview" }), false);
  assert.equal(trustedWorkflowRun({ ...run, path: ".github/workflows/other.yml" }), false);
});
test("every batch must succeed and production must remain current, with bounded 429 retries", async () => {
  const urls = Array.from({ length: 10001 }, (_, i) => `${origin}/page-${i}`);
  const sizes = [], waits = [];
  let calls = 0, checks = 0;
  await submitBatches(urls, { fetcher: async (_, options) => { sizes.push(JSON.parse(options.body).urlList.length); return new Response(null, { status: calls++ === 0 ? 429 : 202, headers: { "retry-after": "1" } }); }, pause: async (ms) => waits.push(ms), assertCurrent: async () => { checks++; } });
  assert.deepEqual(sizes, [10000, 10000, 1]); assert.deepEqual(waits, [1000]); assert.equal(checks, 4);
  calls = 0;
  await assert.rejects(submitBatches(urls, { fetcher: async () => new Response(null, { status: calls++ === 0 ? 202 : 500 }) }), /batch 2/);
  await assert.rejects(submitBatches([urls[0]], { fetcher: async () => new Response(null, { status: 429, headers: { "retry-after": "120" } }) }), /retry this workflow later/);
  await assert.rejects(submitBatches(urls, { assertCurrent: async () => { throw new Error("superseded"); }, fetcher: async () => { assert.fail("must not POST"); } }), /superseded/);
  assert.equal(sameRelease(manifest(1), manifest(2)), false);
});
test("published checks enforce key text, matching sitemap dates, actual HTML and real deletions", async () => {
  const m = manifest(1);
  const gone = `${origin}/gone`;
  const responses = new Map([[indexNowKeyLocation, new Response(`${indexNowKey}\n`, { headers: { "content-type": "text/plain" } })], [`${origin}/sitemap.xml`, new Response(`<urlset><url><loc>${origin}/</loc><lastmod>${time(0)}</lastmod></url></urlset>`)], [`${origin}/`, new Response(html())], [gone, new Response("gone", { status: 404 })]]);
  const fetcher = async (url) => responses.get(url).clone();
  await verifyPublished(m, [`${origin}/`, gone], fetcher);
  responses.set(gone, new Response(html()));
  await assert.rejects(verifyPublished(m, [gone], fetcher), /indexable 200/);
  responses.set(`${origin}/`, new Response(html("/", "Stale answer")));
  await assert.rejects(verifyPublished(m, [`${origin}/`], fetcher), /differs/);
  responses.set(indexNowKeyLocation, new Response(indexNowKey, { headers: { "content-type": "text/html" } }));
  await assert.rejects(verifyPublished(m, [], fetcher), /plain text/);
});
