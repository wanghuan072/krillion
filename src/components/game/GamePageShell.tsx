import { ContentBlocks } from "@/src/components/content/ContentBlocks";
import { GameCard } from "./GameCard";
import { GamePlayer } from "./GamePlayer";
import { GameVideoSection } from "./GameVideoSection";
import { GameReviews } from "./GameReviews";
import { HeightAwareRail } from "./HeightAwareRail";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { absoluteUrl, gamePath } from "@/src/lib/url-policy";
import { getHomepageSections, getRecommendedGames, getSidebarSections } from "@/src/lib/data/game-loader";
import type { Game, VideoBlock } from "@/src/types/game";
import styles from "@/src/style/site.module.css";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/src/seo/structured-data";

function GameGroup({ heading, games, rail = false, compact = false, preview = false }: { heading: string; games: Game[]; rail?: boolean; compact?: boolean; preview?: boolean }) {
  return <section className={rail ? styles.railSection : styles.recommended} aria-labelledby={heading.toLowerCase().replaceAll(" ", "-")}><h2 id={heading.toLowerCase().replaceAll(" ", "-")}>{heading}</h2><div className={rail ? styles.railGrid : styles.recommendedGrid}>{games.map((game) => <GameCard key={game.id} game={game} compact={rail || compact} preview={preview}/>)}</div></section>;
}

export function GamePageShell({ game, home = false, preview = false }: { game: Game; home?: boolean; preview?: boolean }) {
  const homeSections = home ? getHomepageSections({ includeDraft: preview }) : null;
  const side = home ? { featured: homeSections!.featured.slice(0, 6), newlyAdded: homeSections!.newlyAdded.slice(0, 6) } : getSidebarSections(game, { includeDraft: preview });
  const recommended = home ? homeSections!.recommended : getRecommendedGames(game, { includeDraft: preview });
  const videos = game.content.flatMap((section) => section.blocks.filter((block): block is VideoBlock => block.type === "video"));
  const path = home ? "/" : gamePath(game.slug);
  const url = absoluteUrl(path);
  const page = game.page ?? {
    eyebrow: game.categories.join(" · "),
    h1: `Play ${game.title}`,
    intro: `${game.shortDescription} You can start it directly on this page.`,
    videoHeading: `Watch ${game.title} gameplay`,
  };
  return <main id="main-content" className={`${styles.container} ${styles.gamePage}`}>
    <JsonLd data={[
      buildWebPageSchema({ name: game.seo.title, description: game.seo.description, path, publishedAt: game.publishedAt, updatedAt: game.updatedAt }),
      { "@context": "https://schema.org", "@type": "VideoGame", "@id": `${url}#game`, name: game.title, description: game.shortDescription, url, image: absoluteUrl(game.image.src), inLanguage: "en", gamePlatform: "Web Browser", operatingSystem: "Any", genre: game.categories, mainEntityOfPage: { "@id": `${url}#webpage` } },
      buildBreadcrumbSchema(home ? [{ name: "Home", path: "/" }] : [{ name: "Home", path: "/" }, { name: "More Games", path: "/games" }, { name: game.title, path }]),
    ]} />
    <div className={styles.gameLayout}>
      <div className={styles.gameMain}>
        <header className={styles.gameIntro}><span className={styles.eyebrow}>{home ? "Daily open-answer challenge" : page.eyebrow}</span><h1 className={home ? styles.homeH1 : styles.innerH1}>{home ? `Play ${game.title} Online` : page.h1}</h1><p>{home ? `${game.shortDescription} You can start it directly on this page.` : page.intro}</p></header>
        <GamePlayer game={game} preview={preview}/>
        <GameGroup heading={home ? "Games Like Krillion" : "Recommended Games"} games={recommended} compact preview={preview}/>
        <article className={styles.gameArticle}>
          {game.content.map((section) => <section id={section.id} key={section.id}><h2>{section.heading}</h2><ContentBlocks blocks={section.blocks.filter((block) => block.type !== "video")}/></section>)}
        </article>
        <GameVideoSection videos={videos} gameTitle={game.title} heading={page.videoHeading}/>
      </div>
      <HeightAwareRail><GameGroup heading="Featured Games" games={side.featured} rail preview={preview}/><GameGroup heading="New Games" games={side.newlyAdded} rail preview={preview}/><GameReviews gameSlug={game.slug} gameTitle={game.title}/></HeightAwareRail>
    </div>
  </main>;
}
