import fs from "node:fs";
import path from "node:path";

export const answersDirectory = "data/answers";
export const answersBasePath = "/krillion-answers-today";
export const gameTimeZone = "America/New_York";
export const tierNames = { 10: "Plankton", 15: "Too Clever", 30: "Schooler", 60: "Rare", 85: "Deep Cut", 100: "One in a Krillion" };

export function isAnswerDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T12:00:00Z`))
    && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
}

export function gameDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: gameTimeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (name) => parts.find((item) => item.type === name).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function formatAnswerDate(date) {
  if (!isAnswerDate(date)) throw new Error(`Invalid answer date: ${date}`);
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00Z`));
}

export function answerPath(date) {
  if (!isAnswerDate(date)) throw new Error(`Invalid answer date: ${date}`);
  return `${answersBasePath}/${date}`;
}

export function answerSeo(date, diveNumber) {
  const label = formatAnswerDate(date);
  return {
    title: `Krillion Answers for ${label} | Dive #${diveNumber}`,
    description: `Explore Krillion answers for ${label}, Dive #${diveNumber}, with seven daily questions, recorded scores, rarity tiers, and answer lists for every round.`,
    keywords: ["Krillion answers", `Krillion answers ${label}`, `Krillion Dive ${diveNumber}`, "Krillion daily answers"],
  };
}

export function validateAnswerRecord(record) {
  const fail = (message) => { throw new Error(`Daily answers ${record?.date ?? "unknown"}: ${message}`); };
  if (!record || record.schemaVersion !== 1 || !isAnswerDate(record.date)) fail("invalid schema or date");
  if (record.timezone !== gameTimeZone || !Number.isSafeInteger(record.diveNumber) || record.diveNumber < 1) fail("invalid game calendar or dive number");
  if (!["complete", "selected"].includes(record.coverage)) fail("invalid coverage");
  if (!["official-reveal", "preserved"].includes(record.source?.kind)) fail("invalid source");
  if (record.coverage === "complete" && record.source.kind !== "official-reveal") fail("complete answers need an official reveal");
  if (record.source.kind === "official-reveal" && record.source.url !== `https://krillion.io/api/reveal?date=${record.date}`) fail("unexpected source URL");
  for (const key of ["publishedAt", "updatedAt"]) {
    if (typeof record[key] !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(record[key]) || !Number.isFinite(Date.parse(record[key]))) fail(`invalid ${key}`);
  }
  if (Date.parse(record.updatedAt) < Date.parse(record.publishedAt)) fail("update precedes publication");
  if (!Array.isArray(record.questions) || record.questions.length !== 7) fail("exactly seven questions required");
  const ids = new Set();
  for (const question of record.questions) {
    if (typeof question.id !== "string" || !question.id.trim() || ids.has(question.id)) fail("duplicate or missing question ID");
    ids.add(question.id);
    if (typeof question.prompt !== "string" || !question.prompt.trim()) fail("missing prompt");
    if (!Array.isArray(question.answers) || !question.answers.length) fail("empty answer list");
    if (!Number.isSafeInteger(question.answerCount) || question.answerCount < question.answers.length) fail("invalid answer count");
    if (record.coverage === "complete" && question.answerCount !== question.answers.length) fail("incomplete answer list");
    const names = new Set();
    for (const answer of question.answers) {
      if (typeof answer.text !== "string" || !answer.text.trim() || names.has(answer.text.toLowerCase().trim())) fail("duplicate or empty answer");
      names.add(answer.text.toLowerCase().trim());
      if (!Number.isInteger(answer.score) || !Object.hasOwn(tierNames, answer.score) || tierNames[answer.score] !== answer.tier) fail("answer score and tier disagree");
    }
  }
  if (record.totalAcceptedAnswers !== record.questions.reduce((sum, question) => sum + question.answerCount, 0)) fail("answer total mismatch");
  if (JSON.stringify(record.seo) !== JSON.stringify(answerSeo(record.date, record.diveNumber))) fail("metadata must match the date and dive");
  if (record.seo.title.length < 40 || record.seo.title.length > 60 || record.seo.description.length < 140 || record.seo.description.length > 160) fail("metadata length outside limits");
  return record;
}

export function readAnswerArchive(root = process.cwd()) {
  const directory = path.join(root, answersDirectory);
  if (!fs.existsSync(directory)) return [];
  const records = fs.readdirSync(directory).filter((file) => file.endsWith(".json")).map((file) => {
    const record = validateAnswerRecord(JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")));
    if (file !== `${record.date}.json`) throw new Error(`Daily answer filename does not match date: ${file}`);
    return record;
  }).sort((a, b) => b.date.localeCompare(a.date));
  if (new Set(records.map((record) => record.diveNumber)).size !== records.length) throw new Error("Duplicate Daily Dive number");
  return records;
}

export function recordFromReveal(reveal, { date, diveNumber, now = new Date().toISOString(), previous } = {}) {
  if (!isAnswerDate(date) || reveal?.date !== date || !Array.isArray(reveal.prompts) || reveal.prompts.length !== 7) throw new Error("Official reveal must match the requested date and contain seven prompts");
  if (previous && (previous.date !== date || previous.diveNumber !== diveNumber)) throw new Error("Existing date or dive number does not match");
  const questions = reveal.prompts.map((prompt) => ({
    id: prompt.id,
    prompt: prompt.text,
    answerCount: Array.isArray(prompt.answers) ? prompt.answers.length : 0,
    answers: (prompt.answers ?? []).map((answer) => ({ text: answer.answer, tier: tierNames[answer.score], score: answer.score, ...(typeof answer.quip === "string" && answer.quip.trim() ? { note: answer.quip } : {}) })),
  }));
  const record = {
    schemaVersion: 1, date, timezone: gameTimeZone, diveNumber, coverage: "complete",
    publishedAt: previous?.publishedAt ?? now, updatedAt: now,
    source: { kind: "official-reveal", url: `https://krillion.io/api/reveal?date=${date}` },
    totalAcceptedAnswers: questions.reduce((sum, question) => sum + question.answerCount, 0),
    seo: answerSeo(date, diveNumber), questions,
  };
  validateAnswerRecord(record);
  if (previous && JSON.stringify({ ...record, updatedAt: previous.updatedAt }) === JSON.stringify(previous)) return previous;
  return record;
}
