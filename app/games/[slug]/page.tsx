import { notFound } from "next/navigation";
import { GamePageShell } from "@/src/components/game/GamePageShell";
import { getGameBySlug, getGameRouteParams } from "@/src/lib/data/game-loader";
import { gamePath } from "@/src/lib/url-policy";
import { buildMetadata } from "@/src/seo/metadata";

export const dynamicParams = false;
export function generateStaticParams() { return getGameRouteParams(); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const game = getGameBySlug(slug); if (!game) return {}; return buildMetadata({ ...game.seo, path: gamePath(game.slug) }); }
export default async function GameDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const game = getGameBySlug(slug); if (!game) notFound(); return <GamePageShell game={game}/>; }
