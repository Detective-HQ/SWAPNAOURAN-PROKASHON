/**
 * Normalize media URLs so production never tries to load developer localhost files.
 * Relative /uploads paths stay same-origin (Next.js rewrites them to the API).
 */
export function mediaUrl(url?: string | null): string {
  if (!url) return "";

  if (url.startsWith("/uploads/")) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const isLoopback = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (isLoopback && parsed.pathname.startsWith("/uploads/")) {
      return parsed.pathname + parsed.search;
    }
  } catch {
    // not an absolute URL
  }

  return url;
}
