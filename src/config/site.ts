export const siteConfig = {
  name: "Krillion",
  shortName: "Krillion",
  publisherName: "Checkpoint Nomad",
  origin: "https://krilliongames.com",
  language: "en",
  locale: "en_US",
  logo: "/images/logo.png",
  logoWidth: 96,
  logoHeight: 96,
  socialImage: "/images/og-image.png",
  socialImageWidth: 1200,
  socialImageHeight: 630,
  trailingSlash: false,
} as const;

export const contactEmail = `wyong@${new URL(siteConfig.origin).hostname.replace(/^www\./, "")}`;
