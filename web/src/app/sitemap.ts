import type { MetadataRoute } from "next";
import { SITE_URL } from "./robots";

/** Emits nothing until NEXT_PUBLIC_SITE_URL is set — see robots.ts. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return [];
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
