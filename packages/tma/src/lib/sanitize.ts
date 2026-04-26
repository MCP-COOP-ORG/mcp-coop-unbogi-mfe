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
