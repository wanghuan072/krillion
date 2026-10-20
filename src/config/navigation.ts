export const primaryNavigation = [
  { pageId: "home", label: "Home", path: "/" },
  { pageId: "krillion-unlimited", label: "Krillion Unlimited", path: "/krillion-unlimited" },
  { pageId: "krillion-answers-today", label: "Krillion Answers Today", path: "/krillion-answers-today" },
  { pageId: "guides-index", label: "Guides", path: "/guides" },
  { pageId: "games-index", label: "More Games", path: "/games" },
] as const;

export const legalNavigation = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms of Service", path: "/terms" },
  { label: "Copyright", path: "/copyright" },
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
] as const;
