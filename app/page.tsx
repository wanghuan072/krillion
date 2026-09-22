import { GamePageShell } from "@/src/components/game/GamePageShell";
import { getMainGame } from "@/src/lib/data/game-loader";
import { buildMetadata } from "@/src/seo/metadata";

export function generateMetadata() { const game = getMainGame(); return buildMetadata({ ...game.seo, path: "/" }); }
export default function Home() { return <GamePageShell game={getMainGame()} home/>; }
