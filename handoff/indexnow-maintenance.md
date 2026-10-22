# Sitemap and IndexNow maintenance

This repository uses the Next.js static export on Vercel, production branch `main`, canonical origin `https://krilliongames.com`, project `prj_mNyamEyqiLk2yIUfEoo1q3OTghyx` and repository `wanghuan072/krillion`. The existing public root key is reused. No new service, database, Bing API key or custom GitHub Secret is required.

## Build and dates

`npm run build` prepares the existing page state, exports Next.js, emits host files, then finalizes SEO. Static pages are discovered from `app`; published games, Guides and daily answers come from their existing JSON sources. Unknown exported canonicals or missing registered pages fail the build. Next.js remains the sole Sitemap URL generator; the finalizer verifies its URLs, removes rendered noindex pages and sets dates from actual rendered content.

`seo/page-lastmod.json` retains local content fingerprints and dates. During production builds the finalizer reads the previous production manifest from the fixed canonical origin and preserves dates for identical content. A network error fails the production build. The first migration explicitly retains existing tracked dates after confirming the existing Sitemap, rather than declaring every page newly changed. Subsequent fingerprint format migrations require an explicit rebaseline.

Fingerprints cover visible text, TDK, headings, canonical registry identity, structured data, links, image files, embedded media and game player configuration. CSS, scripts/build IDs, comments, whitespace and copyright years do not refresh dates. Shared cards or navigation changes affect only pages actually rendering them. Removed routes, slug changes and noindex transitions retain deletion event timestamps; restored indexable routes clear their old deletion events.

The exported `/seo-manifest.json` contains public page/version identifiers, no credentials. `generatedAt` is the build time, independent of page `lastModified`. `htmlFingerprint` permits checking the live HTML against the expected release before notification.

## Production notification

The existing `IndexNow` Actions workflow uses the repository's verified `deployment_status` events from `vercel[bot]`. The repository's actual Production deployments were inspected: their `production_environment` flag is false, so the gate checks the trusted sender, creator, environment name, deployment status and manifest identity instead of relying on that flag. Preview and failed events do not submit. Workflow tools are checked out from trusted `main`, never a payload-specified revision.

Capture runs **before** notification concurrency, saves every successful production observation to a separate Actions artifact, and persists an explicit unresolved observation if a historical snapshot cannot be read. The serialized notification job restores observations and the last fully successful notification checkpoint, checks the GitHub deployment timeline for missing intermediate versions, merges unacknowledged deletion events, then checks the fixed production manifest, key, Sitemap, actual page contents and deletion HTTP responses. The public version is checked before each batch and once more before checkpoint creation.

All batches (maximum 10,000 URLs each) must return 200 or 202. A 429 gets at most three bounded retries; longer requested delays require retrying the workflow. Failed/partial submissions and replaced releases cannot advance the checkpoint. Requests to historical deployment URLs carry no credentials and use strict Krillion host validation; GitHub tokens go only to the fixed repository API. Signed artifact downloads do not receive that token.

Observations and successful checkpoints are append-only artifacts retained for 90 days, within the repository's artifact retention limit. Expiration causes a full submission of current eligible URLs plus recoverable deletion events without resetting dates. The initial rollout cannot reconstruct versions that predate the first manifest. The GitHub history audit uses a one-day deployment-creation lookback before the coverage boundary and is bounded at 5,000 deployments/artifacts; exceeding a bound fails rather than silently truncating.

## Actual concurrency and protection boundary

The project uses Vercel Git production deployments. Vercel's control-plane response did not expose build-queue concurrency settings, so strict release serialization has **not** been asserted. Per-production artifacts and deployment-history reconciliation cover concurrent intermediate releases when their manifests are captured or readable. Protected historical Vercel URLs may return authentication pages. If an intermediate successful release was replaced before capture and its immutable manifest is protected, notification fails explicitly and retains the observation; it cannot claim complete coverage or recover that snapshot from two end-state manifests. No protection bypass credential is added. Avoid interleaved manual promotions/CLI releases; rebuild rollback content so Sitemap dates advance correctly. Old immutable promotions cannot have their dates repaired by a notification script.

## Validation and first live run

Local checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run audit:indexnow`, `npm run build`, `npm run audit:output`, and `npm run test:answers:browser`. The last command intercepts static exports in Playwright and starts no server. `npm run indexnow:submit` is a local dry run and sends nothing. The real `--confirm` path requires the trusted Actions environment and successful published manifest.

After an authorized push and successful production deployment, check `/seo-manifest.json`, `/sitemap.xml`, `/robots.txt` and the key file, then the IndexNow workflow and its two artifact types. `workflow_dispatch` has no parameters and retries the current public production version. HTTP 200/202 confirms reception, not search-engine indexing. This local integration does not itself publish files, change Vercel settings or send an IndexNow notification.
