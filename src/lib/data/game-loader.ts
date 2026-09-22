import additionsJson from "@/data/games/games.json";
import mainJson from "@/data/games/main-game.json";
import type { Game } from "@/src/types/game";

const mainGame = mainJson as Game;
const additions = additionsJson as Game[];

export function getMainGame(options: { includeDraft?: boolean } = {}) {
  if (!options.includeDraft && mainGame.status !== "published") throw new Error("Main game is not published");
  return mainGame;
}

export function getAllGames(options: { includeDraft?: boolean } = {}) {
  return options.includeDraft ? additions : additions.filter((game) => game.status === "published");
}

export function getAllPublishedGames() { return getAllGames(); }
export function getGameBySlug(slug: string, options: { includeDraft?: boolean } = {}) { return getAllGames(options).find((game) => game.slug === slug); }
export function getGameById(id: string, options: { includeDraft?: boolean } = {}) { return getAllGames(options).find((game) => game.id === id); }
export function getGameRouteParams() { return getAllPublishedGames().map(({ slug }) => ({ slug })); }

const byStableId = (games: Game[], ids: string[]) => ids.map((id) => {
  const game = games.find((candidate) => candidate.id === id);
  if (!game) throw new Error(`Missing related game ${id}`);
  return game;
});

export function getHomepageSections(options: { includeDraft?: boolean } = {}) {
  const games = getAllGames(options);
  const featured = games.filter((game) => game.flags.isFeaturedHome);
  const newlyAdded = [...games].filter((game) => game.flags.isNewHome).sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || a.id.localeCompare(b.id));
  const recommended = games.filter((game) => game.flags.isRecommendedHome);
  return { featured, newlyAdded, recommended };
}

export function getSidebarSections(current: Game, options: { includeDraft?: boolean } = {}) {
  const games = getAllGames(options).filter((game) => game.id !== current.id);
  const related = new Set(current.relatedGameIds);
  const stable = (items: Game[]) => [...items].sort((a, b) => Number(related.has(b.id)) - Number(related.has(a.id)) || a.id.localeCompare(b.id));
  return {
    featured: stable(games.filter((game) => game.flags.isFeaturedHome)).slice(0, 6),
    newlyAdded: [...games].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || a.id.localeCompare(b.id)).slice(0, 6),
  };
}

export function getRecommendedGames(current: Game, options: { includeDraft?: boolean } = {}) {
  const games = getAllGames(options).filter((game) => game.id !== current.id);
  if (current.id === mainGame.id) return games.filter((game) => game.flags.isRecommendedHome).slice(0, 6);
  return byStableId(games, current.relatedGameIds).slice(0, 6);
}

export function getGameFrameOrigins(options: { includeDraft?: boolean } = {}) {
  const values = [getMainGame(options).player.iframeSrc, ...getAllGames(options).map((game) => game.player.iframeSrc)];
  return [...new Set(values.flatMap((value, index) => {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") return [];
      const origins = [url.origin];
      if (url.hostname === "azgames.io") origins.push("https://game.azgame.io", "https://suikagame.io");
      const placementDomain = url.searchParams.get("fg_domain");
      if (placementDomain && /^[a-z0-9.-]+$/i.test(placementDomain)) origins.push(`https://${placementDomain}`);
      return origins;
    }
    catch { if (index === 0) return []; throw new Error(`Invalid published game URL: ${value}`); }
  }))].sort();
}

export function getPublishedGameFrameOrigins() { return getGameFrameOrigins(); }
