export type ImageAsset = { src: string; alt: string; width: number | null; height: number | null };

export type VideoBlock = {
  type: "video";
  provider: "youtube";
  videoId: string;
  title: string;
  description: string;
  poster: ImageAsset;
};

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | ({ type: "image"; caption?: string } & ImageAsset)
  | { type: "list"; style: "ordered" | "unordered"; items: string[] }
  | { type: "steps"; items: { title: string; body: string }[] }
  | { type: "callout"; tone: "info" | "tip" | "warning"; label?: string; body: string }
  | { type: "table"; columns: string[]; rows: string[][] }
  | VideoBlock
  | { type: "faq"; items: { question: string; answer: string }[] };

export type ContentSection = { id: string; heading: string; blocks: ContentBlock[] };

export type Game = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string | null;
  tags: string[];
  categories: string[];
  flags: { isNewHome: boolean; isFeaturedHome: boolean; isRecommendedHome: boolean };
  image: ImageAsset;
  player: {
    iframeSrc: string;
    aspectRatio: string | null;
    orientation: "landscape" | "portrait" | "adaptive";
    permissionsPolicy: string[];
    referrerPolicy: React.IframeHTMLAttributes<HTMLIFrameElement>["referrerPolicy"] | null;
    sandbox: string[] | null;
    loadTimeoutMs: number;
  };
  seo: { title: string; description: string; keywords: string[] };
  content: ContentSection[];
  relatedGameIds: string[];
};
