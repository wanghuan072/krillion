"use client";

import { useEffect, useState } from "react";

export function AnswerAvailability({ latestDate }: { latestDate: string }) {
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      const part = (name: string) => parts.find((item) => item.type === name)?.value;
      setCurrentDate(`${part("year")}-${part("month")}-${part("day")}`);
    };
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return <p role="status" data-answer-availability={currentDate === null ? "latest" : currentDate === latestDate ? "today" : "pending"}>
    {currentDate === null ? "Latest available Daily Dive. Check its game date before opening the answers." : currentDate === latestDate ? "Today’s answers are ready. Open the dated page below to see all seven questions." : "Today’s answers are not available here yet. The latest available dive keeps its original date below."}
  </p>;
}
