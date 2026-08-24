export const CANONICAL_SITE_URL = "https://mariaesergio.com";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || CANONICAL_SITE_URL;
}
