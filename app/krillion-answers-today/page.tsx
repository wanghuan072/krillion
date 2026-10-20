import type { Metadata } from "next";
import tdk from "@/seo/tdk.js";
import { KrillionAnswersTodayPage } from "@/src/components/topics/KrillionTopicPages";
import { buildMetadata } from "@/src/seo/metadata";

export const metadata: Metadata = buildMetadata({ ...tdk["krillion-answers-today"], path: "/krillion-answers-today" });

export default function Page() {
  return <KrillionAnswersTodayPage title={tdk["krillion-answers-today"].title} description={tdk["krillion-answers-today"].description} />;
}
