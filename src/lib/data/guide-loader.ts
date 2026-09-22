import howTo from "@/data/guides/how-to-play-krillion.json";
import scoring from "@/data/guides/krillion-scoring-and-rare-answers.json";
import help from "@/data/guides/krillion-loading-and-input-help.json";
import type { Guide } from "@/src/types/guide";

const guides = [howTo, scoring, help] as Guide[];

export function getAllGuides(options: { includeDraft?: boolean } = {}) { return options.includeDraft ? guides : guides.filter((guide) => guide.status === "published"); }
export function getAllPublishedGuides() { return getAllGuides(); }
export function getGuideBySlug(slug: string, options: { includeDraft?: boolean } = {}) { return getAllGuides(options).find((guide) => guide.slug === slug); }
export function getGuideById(id: string, options: { includeDraft?: boolean } = {}) { return getAllGuides(options).find((guide) => guide.id === id); }
export function getGuideRouteParams() { return getAllPublishedGuides().map(({ slug }) => ({ slug })); }
export function getRelatedGuides(guide: Guide, options: { includeDraft?: boolean } = {}) { return guide.relatedGuideIds.map((id) => getGuideById(id, options)).filter((item): item is Guide => Boolean(item)); }
