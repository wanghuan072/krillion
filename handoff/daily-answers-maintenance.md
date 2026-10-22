# Daily answer maintenance

The fixed `/krillion-answers-today` URL lists dated records. Detail routes use `/krillion-answers-today/YYYY-MM-DD`. All links use full document navigation. The existing header configuration is unchanged.

## Synchronizing a day

Run from this project directory with Node.js 20 or newer:

```sh
npm run answers:sync
npm run build
npm run audit:output
npm test
npm run test:answers:browser
```

`answers:sync` requests the original game's public `https://krillion.io/api/reveal?date=YYYY-MM-DD` endpoint for the current `America/New_York` calendar date. An explicit date is supported:

```sh
npm run answers:sync -- --date 2026-10-21 --dive 98
```

Each successful sync saves one validated JSON record in `data/answers/`. Rerunning the same date updates that record only if answers or explanations changed, preserving its first publication time. A new date creates a new record and never replaces earlier days. Dive numbers follow the existing date/number anchor; use `--dive` if the publisher changes that sequence.

The endpoint is publicly accessible but has no verified stability guarantee. Older dates may return unavailable. A failed request, wrong date, missing question, invalid score, or duplicate answer stops the sync without replacing saved records. Do not backfill missing official data with generated answers. Keep API credentials out of this workflow: this request needs none.

The migrated October 20 record contains the site's existing selections and is marked `selected`, not a complete official reveal. October 21 contains the complete official reveal; it originally contained 3,758 answers and was revised by the publisher to 3,796 when rechecked on October 22 Beijing time. Source information stays in the data for maintenance; public pages explain the applicable game and answer coverage without exposing internal collection procedures.

## Scheduling and publishing

An active automation in this chat runs daily at 14:00 Asia/Shanghai. The user has authorized creating a dated page for each newly available original-game Daily Dive, updating the list, and committing and pushing task-related changes to `https://github.com/wanghuan072/krillion.git`, branch `main`, after validation, without asking again for routine authorized commits and pushes. This authorization covers only this repository, branch, and daily-answer task. Preserve other user changes; never force-push or include unrelated files. The user also explicitly authorized the combined initial answer-page and IndexNow/Sitemap commit `adf1a7387fdd44122a8c9edda6622890ce066668`; its earlier push attempts failed due to network connectivity, but remote main was confirmed to contain it during the October 22 14:00 Beijing run. Future runs must check remote state before retrying any pending commit, without recreating it or pushing unrelated commits. Creating or updating the schedule does not itself perform a Git commit or push.

The configured 14:00 Beijing run follows New York's midnight rollover in both summer and winter. Still use the latest actually available game date, never relabel a prior dive as today's, and do not create duplicate pages or empty commits when nothing changed. Avoid overlapping executions. Monitor nonzero exit codes rather than treating a missing reveal as an empty day. Retry transient network failures at most three times, retaining local commits if connectivity remains unavailable. Report validation, authentication, branch-protection, or non-fast-forward failures while preserving local work. Do not start project services or execute additional deployment commands. A normal GitHub push may trigger the repository's existing CI; do not alter its deployment configuration.

Builds are intentionally offline and deterministic: `npm run build` never contacts the game's API. After a successful sync, the publishing pipeline must rebuild and deploy `out/` for new routes to appear online. The browser-side availability message switches to pending after the date rolls over, but cannot publish data or refresh a static export by itself.

## Metadata and verification

- Static list metadata stays in `seo/tdk.js`.
- Every dated record stores generated metadata, validated against its own date and dive number. The detail H1 includes the date/number, and question H2s preserve the exact stored prompt wording.
- Publication/update timestamps describe the page, independently of the game's date.
- Each dated detail has its own canonical, breadcrumb, social metadata, and sitemap entry. Fingerprints retain dates for unchanged content, including repeated syncs.
- IndexNow's existing post-deployment submission code now includes dated records. No IndexNow request is sent by sync or build.
- `npm run test:answers:browser` serves exported files through Playwright request interception. It launches no project server. It verifies desktop/mobile document navigation, history, metadata, expandable lists, missing dates, and the stale-day message. Third-party ad/analytics responses are mocked, so real ad delivery and analytics receipt are not verified.
