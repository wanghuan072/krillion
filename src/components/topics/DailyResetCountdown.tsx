"use client";

import { useEffect, useState } from "react";

function formatRemaining(resetAt: string) {
  const remainingSeconds = Math.max(0, Math.floor((Date.parse(resetAt) - Date.now()) / 1000));

  if (remainingSeconds === 0) {
    return "New dive available";
  }

  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const clock = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");

  return days > 0 ? days + "d " + clock : clock;
}

export function DailyResetCountdown({ resetAt }: { resetAt: string }) {
  const [remaining, setRemaining] = useState("--:--:--");

  useEffect(() => {
    const update = () => setRemaining(formatRemaining(resetAt));
    update();
    const intervalId = window.setInterval(update, 1000);

    return () => window.clearInterval(intervalId);
  }, [resetAt]);

  return <time dateTime={resetAt} role="timer" aria-label="Time until the next Krillion Daily Dive">{remaining}</time>;
}
