import { notFound } from "next/navigation";
import { DailyAnswersDetail } from "@/src/components/topics/DailyAnswerPages";
import { getAnswersByDate, getAnswerRouteParams } from "@/src/lib/data/answer-loader";
import { answerPath } from "@/scripts/lib/daily-answers.mjs";
import { buildMetadata } from "@/src/seo/metadata";

export const dynamicParams = false;
export function generateStaticParams() { return getAnswerRouteParams(); }

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const dive = getAnswersByDate(date);
  if (!dive) notFound();
  return buildMetadata({ ...dive.seo, path: answerPath(date), type: "article", publishedTime: dive.publishedAt, modifiedTime: dive.updatedAt });
}

export default async function DailyAnswerPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const dive = getAnswersByDate(date);
  if (!dive) notFound();
  return <DailyAnswersDetail dive={dive} />;
}
