import type { Metadata } from "next";
import { GameCard } from "@/src/components/game/GameCard";
import { getAllPublishedGames } from "@/src/lib/data/game-loader";
import { buildMetadata } from "@/src/seo/metadata";
import styles from "@/src/style/site.module.css";
import tdk from "@/seo/tdk.js";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { absoluteUrl } from "@/src/lib/url-policy";

export const metadata: Metadata = buildMetadata({ ...tdk["games-index"], path: "/games" });
export default function GamesPage() {
  const games = getAllPublishedGames();
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: tdk["games-index"].title, description: tdk["games-index"].description, url: absoluteUrl("/games"), mainEntity: { "@type": "ItemList", itemListElement: games.map((game, index) => ({ "@type": "ListItem", position: index + 1, name: game.title, url: absoluteUrl(`/games/${game.slug}`) })) } };
  return <main id="main-content" className={`${styles.container} ${styles.indexPage}`}><JsonLd data={schema}/><span className={styles.eyebrow}>Playable alternatives</span><h1 className={styles.innerH1}>More Games</h1><p>Choose another word, trivia, spelling, or deduction game. Every published entry opens its own player and dedicated guide.</p><div className={styles.gamesGrid}>{games.map((game) => <GameCard key={game.id} game={game}/>)}</div></main>;
}
