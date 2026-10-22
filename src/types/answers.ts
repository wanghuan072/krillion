export type DailyAnswer = { text: string; tier: string; score: number; note?: string };
export type DailyQuestion = {
  id: string;
  prompt: string;
  answerCount: number;
  answers: DailyAnswer[];
  hint?: string;
  explanation?: string;
  watchFor?: string;
};
export type DailyDive = {
  schemaVersion: number;
  date: string;
  timezone: string;
  diveNumber: number;
  coverage: "complete" | "selected";
  publishedAt: string;
  updatedAt: string;
  source: { kind: "official-reveal" | "preserved"; url?: string };
  totalAcceptedAnswers: number;
  seo: { title: string; description: string; keywords: string[] };
  questions: DailyQuestion[];
};
