export function composeCsp(gameOrigins: string[], videoOrigins: string[] = []) {
  const frameSources = ["'self'", ...gameOrigins, ...videoOrigins].join(" ");
  const isDevelopment = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    `frame-src ${frameSources}`,
    `connect-src 'self' https:${isDevelopment ? " ws: wss:" : ""}`,
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
