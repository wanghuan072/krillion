const normalizeOrigin = (value: string) => value.trim().replace(/\/+$/, "");

export const commentConfig = {
  apiOrigin: normalizeOrigin(
    process.env.NEXT_PUBLIC_COMMENT_API_ORIGIN ?? "https://comment-api-pi.vercel.app",
  ),
  projectSlug:
    process.env.NEXT_PUBLIC_COMMENT_PROJECT_SLUG?.trim() || "krillion",
  sectionSlug:
    process.env.NEXT_PUBLIC_COMMENT_SECTION_SLUG?.trim() || "krillion",
  apiKey: process.env.NEXT_PUBLIC_COMMENT_API_KEY?.trim() || "",
  pageSize: 6,
} as const;

export const commentConfigReady = Boolean(
  commentConfig.apiOrigin &&
    commentConfig.projectSlug &&
    commentConfig.sectionSlug &&
    commentConfig.apiKey,
);
