export const siteConfig = {
  name: "Krillion",
  shortName: "Krillion",
  publisherName: "Checkpoint Nomad",
  origin: "https://testkrillion.com",
  language: "en",
  locale: "en_US",
  logo: "/images/logo.png",
  logoWidth: 240,
  logoHeight: 80,
  socialImage: "/images/og-image.png",
  socialImageWidth: 1200,
  socialImageHeight: 630,
  trailingSlash: false,
} as const;

export const contactEmail = `wyong@${new URL(siteConfig.origin).hostname.replace(/^www\./, "")}`;
