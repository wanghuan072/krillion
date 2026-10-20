import type { Metadata } from "next";
import tdk from "@/seo/tdk.js";
import { KrillionUnlimitedPage } from "@/src/components/topics/KrillionTopicPages";
import { buildMetadata } from "@/src/seo/metadata";

export const metadata: Metadata = buildMetadata({ ...tdk["krillion-unlimited"], path: "/krillion-unlimited" });

export default function Page() {
  return <KrillionUnlimitedPage title={tdk["krillion-unlimited"].title} description={tdk["krillion-unlimited"].description} />;
}
