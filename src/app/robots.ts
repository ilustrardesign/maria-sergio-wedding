import type { MetadataRoute } from "next";

import { CANONICAL_SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: CANONICAL_SITE_URL,
  };
}
