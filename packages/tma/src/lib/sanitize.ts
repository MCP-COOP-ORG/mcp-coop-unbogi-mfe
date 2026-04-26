/**
 * Security helpers — XSS mitigation for untrusted URLs.
 *
 * Any URL rendered via CSS `url()` or `<img src>` from external data
 * MUST pass through sanitizeImageUrl first.
 */

const SAFE_PROTOCOLS = ['https:', 'http:', 'data:'] as const;
const FALLBACK = 'about:blank';

/**
 * Returns the URL unchanged if its protocol is safe, otherwise returns a fallback.
 * Prevents `javascript:`, `vbscript:`, and other exotic protocols from being injected.
 */
export function sanitizeImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if ((SAFE_PROTOCOLS as readonly string[]).includes(parsed.protocol)) {
      return url;
    }
    return FALLBACK;
  } catch {
    // Relative URLs (e.g. "/img/photo.jpg") are safe — they resolve against origin.
    return url;
  }
}

/**
 * Runtime check for image URL readiness.
 *
 * Returns true if the URL is a non-empty string that passes sanitization
 * (i.e. it won't resolve to `about:blank`). Use before rendering <img> or
 * CSS background-image to avoid broken placeholders.
 *
 * @example
 * if (isImageReady(gift.imageUrl)) {
 *   return <Postcard imageUrl={gift.imageUrl} />;
 * }
 */
export function isImageReady(url: string | undefined | null): url is string {
  if (!url || url.trim().length === 0) return false;
  return sanitizeImageUrl(url) !== FALLBACK;
}

