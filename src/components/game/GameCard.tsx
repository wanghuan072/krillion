import Image from "next/image";
import { gamePath } from "@/src/lib/url-policy";
import type { Game } from "@/src/types/game";
import styles from "@/src/style/site.module.css";

export function GameCard({ game, compact = false, preview = false }: { game: Game; compact?: boolean; preview?: boolean }) {
  return <a href={preview ? `/preview-internal/game/${game.slug}` : gamePath(game.slug)} className={`${styles.gameCard} ${compact ? styles.gameCardCompact : ""}`}>
    <div className={styles.cardMedia}>{game.image.src ? <Image src={game.image.src} alt={game.image.alt} width={game.image.width ?? 1280} height={game.image.height ?? 720}/> : preview ? <div className={styles.previewThumb}>{game.title.slice(0, 1)}</div> : null}</div>
    <div className={styles.cardCopy}><strong>{game.title}</strong>{!compact && <span>{game.shortDescription}</span>}</div>
  </a>;
}
