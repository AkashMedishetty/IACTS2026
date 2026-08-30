import type { MetadataRoute } from "next";

/**
 * The production domain is not decided yet, and a guessed hostname in
 * robots/sitemap is a fabricated fact that search engines would act on.
 * Set NEXT_PUBLIC_SITE_URL (e.g. https://iactstechnocollege2026.org) and both
 * this file and sitemap.ts start emitting real values.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    ...(SITE_URL ? { sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL } : {}),
  };
}
