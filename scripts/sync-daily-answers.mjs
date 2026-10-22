import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { answersDirectory, gameDate, isAnswerDate, readAnswerArchive, recordFromReveal } from "./lib/daily-answers.mjs";

export async function syncDailyAnswers({ date = gameDate(), diveNumber, root = process.cwd(), fetcher = fetch } = {}) {
  if (!isAnswerDate(date) || date > gameDate()) throw new Error("Choose an available game date, not a future date");
  const archive = readAnswerArchive(root);
  const previous = archive.find((record) => record.date === date);
  const anchor = archive[0];
  const offset = anchor ? Math.round((Date.parse(`${date}T12:00:00Z`) - Date.parse(`${anchor.date}T12:00:00Z`)) / 86400000) : 0;
  const number = diveNumber ?? previous?.diveNumber ?? (anchor ? anchor.diveNumber + offset : undefined);
  if (!Number.isSafeInteger(number) || number < 1) throw new Error("An initial --dive number is required");
  const response = await fetcher(`https://krillion.io/api/reveal?date=${date}`, { signal: AbortSignal.timeout(30000), headers: { Accept: "application/json" }, redirect: "error" });
  if (!response.ok) throw new Error(`Official answers unavailable (${response.status}); saved dates were left unchanged`);
  const record = recordFromReveal(await response.json(), { date, diveNumber: number, previous });
  if (archive.some((item) => item.date !== date && item.diveNumber === number)) throw new Error("Dive number already belongs to another date");
  if (record === previous) return { date, changed: false, record };
  const directory = path.join(root, answersDirectory);
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, `${date}.json`);
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx" });
    fs.renameSync(temporary, file);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  return { date, changed: true, record };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg, index) => index % 2 === 0 && !["--date", "--dive"].includes(arg)) || args.length % 2) throw new Error("Usage: npm run answers:sync -- [--date YYYY-MM-DD] [--dive NUMBER]");
    const options = Object.fromEntries(Array.from({ length: args.length / 2 }, (_, index) => [args[index * 2].slice(2), args[index * 2 + 1]]));
    const result = await syncDailyAnswers({ ...(options.date ? { date: options.date } : {}), ...(options.dive ? { diveNumber: Number(options.dive) } : {}) });
    console.log(`${result.changed ? "Saved" : "Unchanged"} Daily Dive #${result.record.diveNumber} for ${result.date}: 7 questions, ${result.record.totalAcceptedAnswers} answers. Rebuild the static site to include changes.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
