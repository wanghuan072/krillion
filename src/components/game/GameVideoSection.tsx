import type { VideoBlock } from "@/src/types/game";
import styles from "@/src/style/site.module.css";

function Video({ video }: { video: VideoBlock }) {
  return <article className={styles.videoCard}>
    <h3>{video.title}</h3><p>{video.description}</p>
    <div className={styles.videoFrame}><iframe src={`https://www.youtube-nocookie.com/embed/${video.videoId}`} title={video.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture" allowFullScreen/></div>
  </article>;
}

export function GameVideoSection({ videos, gameTitle }: { videos: VideoBlock[]; gameTitle: string }) {
  if (!videos.length) return null;
  return <section className={styles.videoSection} aria-labelledby="game-videos"><h2 id="game-videos">Watch {gameTitle} gameplay</h2>{videos.map((video) => <Video key={video.videoId} video={video}/>)}</section>;
}
