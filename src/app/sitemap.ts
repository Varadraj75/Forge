import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllChallenges } from "@/lib/challenges";

export default function sitemap(): MetadataRoute.Sitemap {
  const challengeRoutes: MetadataRoute.Sitemap = getAllChallenges().map((c) => ({
    url: `${SITE_URL}/challenges/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...challengeRoutes,
  ];
}
