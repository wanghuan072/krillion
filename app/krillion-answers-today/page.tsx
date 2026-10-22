import type { Metadata } from "next";
import tdk from "@/seo/tdk.js";
import { DailyAnswersIndex } from "@/src/components/topics/DailyAnswerPages";
import { buildMetadata } from "@/src/seo/metadata";

export const metadata: Metadata = buildMetadata({ ...tdk["krillion-answers-today"], path: "/krillion-answers-today" });

export default function Page() {
  return <DailyAnswersIndex title={tdk["krillion-answers-today"].title} description={tdk["krillion-answers-today"].description} />;
}
