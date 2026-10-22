import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { answerPath, answerSeo, gameDate, isAnswerDate, readAnswerArchive, recordFromReveal, validateAnswerRecord } from "../scripts/lib/daily-answers.mjs";
import { syncDailyAnswers } from "../scripts/sync-daily-answers.mjs";

const date = "2026-10-20";
const reveal = () => ({ date, prompts: Array.from({ length: 7 }, (_, index) => ({ id: `p${index + 1}`, text: `Question ${index + 1}`, answers: [{ answer: `Answer ${index + 1}`, score: 100, tier: "krillion", quip: "A recorded answer." }, { answer: `Alternative ${index + 1}`, score: 10, tier: "plankton" }] })) });
const make = (value = reveal(), previous) => recordFromReveal(value, { date, diveNumber: 97, now: "2026-10-21T06:00:00.000Z", previous });

test("the game calendar handles midnight and daylight saving without changing historical dates", () => {
  assert.equal(gameDate(new Date("2026-10-21T03:59:00Z")), "2026-10-20");
  assert.equal(gameDate(new Date("2026-10-21T04:00:00Z")), "2026-10-21");
  assert.equal(gameDate(new Date("2026-11-02T04:59:00Z")), "2026-11-01");
  assert.equal(gameDate(new Date("2026-11-02T05:00:00Z")), "2026-11-02");
  for (const value of ["2026-02-30", "2026-13-01", "../2026-10-20", "2026-1-1"]) {
    assert.equal(isAnswerDate(value), false);
    assert.throws(() => answerPath(value));
  }
});

test("dated SEO uses each record's calendar and passes length limits across months", () => {
  for (let month = 1; month <= 12; month++) {
    const seo = answerSeo(`2026-${String(month).padStart(2, "0")}-01`, 1000);
    assert.ok(seo.title.length >= 40 && seo.title.length <= 60);
    assert.ok(seo.description.length >= 140 && seo.description.length <= 160);
    assert.ok(seo.title.includes("2026") && seo.title.includes("#1000"));
  }
  const record = make();
  assert.equal(record.publishedAt, "2026-10-21T06:00:00.000Z");
  assert.equal(record.date, "2026-10-20");
  assert.equal(record.totalAcceptedAnswers, 14);
});

test("bad reveals cannot become published dated records", () => {
  const badDate = reveal(); badDate.date = "2026-10-19";
  const missing = reveal(); missing.prompts.pop();
  const empty = reveal(); empty.prompts[0].answers = [];
  const badScore = reveal(); badScore.prompts[0].answers[0].score = 99;
  const duplicate = reveal(); duplicate.prompts[1].id = "p1";
  const repeated = reveal(); repeated.prompts[0].answers.push({ ...repeated.prompts[0].answers[0] });
  for (const value of [badDate, missing, empty, badScore, duplicate, repeated]) assert.throws(() => make(value));
  const invalid = make(); invalid.totalAcceptedAnswers++;
  assert.throws(() => validateAnswerRecord(invalid));
});

test("rechecking identical answers preserves publication and modification timestamps", () => {
  const previous = make();
  const same = recordFromReveal(reveal(), { date, diveNumber: 97, now: "2026-10-21T09:00:00.000Z", previous });
  assert.equal(same, previous);
  const changed = reveal(); changed.prompts[0].answers[0].quip = "A corrected explanation.";
  const revised = recordFromReveal(changed, { date, diveNumber: 97, now: "2026-10-21T09:00:00.000Z", previous });
  assert.equal(revised.publishedAt, previous.publishedAt);
  assert.equal(revised.updatedAt, "2026-10-21T09:00:00.000Z");
});

test("sync adds dates without destroying history, and failed or malformed responses write nothing", async (t) => {
  const parent = path.resolve("tests");
  const root = fs.mkdtempSync(path.join(parent, ".daily-answers-"));
  t.after(() => {
    assert.equal(path.dirname(root), parent);
    assert.ok(path.basename(root).startsWith(".daily-answers-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const success = async () => Response.json(reveal());
  await syncDailyAnswers({ root, date, diveNumber: 97, fetcher: success });
  const file = path.join(root, "data/answers", `${date}.json`);
  const original = fs.readFileSync(file, "utf8");
  assert.equal((await syncDailyAnswers({ root, date, fetcher: success })).changed, false);
  for (const fetcher of [async () => new Response("unavailable", { status: 403 }), async () => Response.json({ date, prompts: [] }), async () => { throw new Error("network down"); }]) {
    await assert.rejects(syncDailyAnswers({ root, date, fetcher }));
    assert.equal(fs.readFileSync(file, "utf8"), original);
  }
  const next = reveal(); next.date = "2026-10-21";
  const result = await syncDailyAnswers({ root, date: next.date, fetcher: async () => Response.json(next) });
  assert.equal(result.record.diveNumber, 98);
  assert.equal(fs.readFileSync(file, "utf8"), original);
  assert.equal(readAnswerArchive(root).length, 2);
});

test("the public archive distinguishes preserved selections from complete official answers", () => {
  const archive = readAnswerArchive();
  assert.equal(archive.find((dive) => dive.date === "2026-10-20").coverage, "selected");
  const current = archive.find((dive) => dive.date === "2026-10-21");
  assert.equal(current.coverage, "complete");
  assert.equal(current.source.kind, "official-reveal");
  assert.equal(current.totalAcceptedAnswers, current.questions.reduce((sum, question) => sum + question.answers.length, 0));
});
