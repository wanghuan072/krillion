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

function GameGroup({ heading, games, rail = false, compact = false, preview = false }: { heading: string; games: Game[]; rail?: boolean; compact?: boolean; preview?: boolean }) {
  return <section className={rail ? styles.railSection : styles.recommended} aria-labelledby={heading.toLowerCase().replaceAll(" ", "-")}><h2 id={heading.toLowerCase().replaceAll(" ", "-")}>{heading}</h2><div className={rail ? styles.railGrid : styles.recommendedGrid}>{games.map((game) => <GameCard key={game.id} game={game} compact={rail || compact} preview={preview}/>)}</div></section>;
}

export function GamePageShell({ game, home = false, preview = false }: { game: Game; home?: boolean; preview?: boolean }) {
  const homeSections = home ? getHomepageSections({ includeDraft: preview }) : null;
  const side = home ? { featured: homeSections!.featured.slice(0, 6), newlyAdded: homeSections!.newlyAdded.slice(0, 6) } : getSidebarSections(game, { includeDraft: preview });
  const recommended = home ? homeSections!.recommended : getRecommendedGames(game, { includeDraft: preview });
  const videos = game.content.flatMap((section) => section.blocks.filter((block): block is VideoBlock => block.type === "video"));
  return <main id="main-content" className={`${styles.container} ${styles.gamePage}`}>
    <JsonLd data={[{"@context":"https://schema.org","@type":"WebPage",name:game.seo.title,description:game.seo.description,url:absoluteUrl(home ? "/" : gamePath(game.slug)),image:absoluteUrl("/images/og-image.png")},{"@context":"https://schema.org","@type":"VideoGame",name:game.title,description:game.shortDescription,url:absoluteUrl(home ? "/" : gamePath(game.slug)),image:absoluteUrl(game.image.src),gamePlatform:"Web Browser",genre:game.categories},{"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:home ? [{"@type":"ListItem",position:1,name:"Home",item:absoluteUrl("/")}] : [{"@type":"ListItem",position:1,name:"Home",item:absoluteUrl("/")},{"@type":"ListItem",position:2,name:"More Games",item:absoluteUrl("/games")},{"@type":"ListItem",position:3,name:game.title,item:absoluteUrl(gamePath(game.slug))}]}]} />
    <div className={styles.gameLayout}>
      <div className={styles.gameMain}>
        <header className={styles.gameIntro}><span className={styles.eyebrow}>{home ? "Daily open-answer challenge" : game.categories.join(" · ")}</span><h1 className={home ? styles.homeH1 : styles.innerH1}>{home ? `Play ${game.title} Online` : `Play ${game.title}`}</h1><p>{game.shortDescription} You can start it directly on this page.</p></header>
        <GamePlayer game={game} preview={preview}/>
        <GameGroup heading="Recommended Games" games={recommended} compact preview={preview}/>
        <article className={styles.gameArticle}>
          {game.content.map((section) => <section id={section.id} key={section.id}><h2>{section.heading}</h2><ContentBlocks blocks={section.blocks.filter((block) => block.type !== "video")}/></section>)}
        </article>
        <GameVideoSection videos={videos} gameTitle={game.title}/>
      </div>
      <HeightAwareRail><GameGroup heading="Featured Games" games={side.featured} rail preview={preview}/><GameGroup heading="New Games" games={side.newlyAdded} rail preview={preview}/><GameReviews gameSlug={game.slug} gameTitle={game.title}/></HeightAwareRail>
    </div>
  </main>;
}
