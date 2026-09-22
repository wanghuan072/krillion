import type { ContentBlock, ImageAsset } from "./game";

export type Guide = {
  id: string;
  slug: string;
  status: "draft" | "published";
  title: string;
  author: string;
  summary: string;
  tags: string[];
  publishedAt: string | null;
  updatedAt: string | null;
  cover: ImageAsset;
  seo: { title: string; description: string };
  sections: { id: string; title: string; blocks: ContentBlock[] }[];
  relatedGuideIds: string[];
};
