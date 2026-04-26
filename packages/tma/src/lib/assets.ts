/**
 * Centralized asset registry.
 *
 * All static asset paths go through here — single place to update
 * if BASE_URL or filenames change.
 */

const base = import.meta.env.BASE_URL;

export const ASSETS = {
  LOGO: `${base}logo-7.png`,
  BIRD: `${base}bird.png`,
} as const;
