import type { Metadata } from "next";
import { GameCard } from "@/src/components/game/GameCard";
import { getAllPublishedGames } from "@/src/lib/data/game-loader";
import { buildMetadata } from "@/src/seo/metadata";
import styles from "@/src/style/site.module.css";
import tdk from "@/seo/tdk.js";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { gamePath } from "@/src/lib/url-policy";
import { buildBreadcrumbSchema, buildItemList, buildWebPageSchema } from "@/src/seo/structured-data";

export const metadata: Metadata = buildMetadata({ ...tdk["games-index"], path: "/games" });
export default function GamesPage() {
  const games = getAllPublishedGames();
  const schema = [
    { ...buildWebPageSchema({ name: tdk["games-index"].title, description: tdk["games-index"].description, path: "/games", type: "CollectionPage" }), mainEntity: buildItemList(games.map((game) => ({ name: game.title, path: gamePath(game.slug) }))) },
    buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "More Games", path: "/games" }]),
  ];
  return <main id="main-content" className={`${styles.container} ${styles.indexPage}`}><JsonLd data={schema}/><span className={styles.eyebrow}>Playable alternatives</span><h1 className={styles.innerH1}>Games Like Krillion</h1><p>Choose another word, trivia, spelling, or deduction game. Every published entry opens its own player and dedicated guide.</p><div className={styles.gamesGrid}>{games.map((game) => <GameCard key={game.id} game={game}/>)}</div></main>;
}
