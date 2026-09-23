import { notFound } from "next/navigation";
import { GuideDetail } from "@/src/components/guides/GuideViews";
import { getGuideBySlug, getGuideRouteParams } from "@/src/lib/data/guide-loader";
import { guidePath } from "@/src/lib/url-policy";
import { buildMetadata } from "@/src/seo/metadata";

export const dynamicParams = false;
export function generateStaticParams() { return getGuideRouteParams(); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const guide = getGuideBySlug(slug); if (!guide) return {}; return buildMetadata({ ...guide.seo, path: guidePath(guide.slug), type: "article", publishedTime: guide.publishedAt, modifiedTime: guide.updatedAt }); }
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const guide = getGuideBySlug(slug); if (!guide) notFound(); return <GuideDetail guide={guide}/>; }
