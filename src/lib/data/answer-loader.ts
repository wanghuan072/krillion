import { readAnswerArchive } from "@/scripts/lib/daily-answers.mjs";
import type { DailyDive } from "@/src/types/answers";

const archive = readAnswerArchive() as DailyDive[];

export function getAnswerArchive() { return archive; }
export function getAnswersByDate(date: string) { return archive.find((record) => record.date === date); }
export function getAnswerRouteParams() { return archive.map(({ date }) => ({ date })); }
