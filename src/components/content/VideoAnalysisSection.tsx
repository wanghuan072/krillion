import type { VideoBlock } from "@/src/types/game";
import styles from "@/src/style/site.module.css";
import { VideoEmbed } from "@/src/components/game/VideoEmbed";

function VideoAnalysis({ video, takeawaysHeading }: { video: VideoBlock; takeawaysHeading: string }) {
  return <article className={styles.videoCard}>
    <h3>{video.title}</h3>
    <p>{video.summary ?? video.description}</p>
    <VideoEmbed video={video}/>
    {video.segments?.length ? <><h4>What happens in the video</h4><ol>{video.segments.map((segment) => <li key={`${video.videoId}-${segment.timecode}`}><strong>{segment.timecode} — {segment.heading}</strong><p>{segment.text}</p></li>)}</ol></> : null}
    {video.takeaways?.length ? <><h4>{takeawaysHeading}</h4><ul>{video.takeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}</ul></> : null}
    {video.versionNote ? <aside className={styles.callout} data-tone="info"><strong>Version note</strong><p>{video.versionNote}</p></aside> : null}
  </article>;
}

export function VideoAnalysisSection({ videos, heading, headingId = "video-analysis", takeawaysHeading = "What we would carry into the next run" }: { videos: VideoBlock[]; heading: string; headingId?: string; takeawaysHeading?: string }) {
  if (!videos.length) return null;
  return <section className={styles.videoSection} aria-labelledby={headingId}><h2 id={headingId}>{heading}</h2>{videos.map((video) => <VideoAnalysis key={video.videoId} video={video} takeawaysHeading={takeawaysHeading}/>)}</section>;
}
