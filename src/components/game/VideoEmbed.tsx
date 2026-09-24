"use client";

import Image from "next/image";
import { useState } from "react";
import type { VideoBlock } from "@/src/types/game";
import styles from "@/src/style/site.module.css";

export function VideoEmbed({ video }: { video: VideoBlock }) {
  const [playing, setPlaying] = useState(false);

  return <div className={styles.videoFrame}>
    {playing ? <iframe src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1`} title={video.title} referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/> : <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${video.title}`}>
      <Image src={video.poster.src} alt={video.poster.alt} width={video.poster.width ?? 1280} height={video.poster.height ?? 720} loading="lazy"/>
      <span aria-hidden="true">▶</span>
    </button>}
  </div>;
}
