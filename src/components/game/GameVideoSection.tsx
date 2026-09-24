import type { VideoBlock } from "@/src/types/game";
import { VideoAnalysisSection } from "@/src/components/content/VideoAnalysisSection";

export function GameVideoSection({ videos, gameTitle, heading }: { videos: VideoBlock[]; gameTitle: string; heading?: string }) {
  return <VideoAnalysisSection videos={videos} heading={heading ?? `Watch ${gameTitle} gameplay`} headingId="game-videos" takeawaysHeading="What we would copy into our next run"/>;
}
