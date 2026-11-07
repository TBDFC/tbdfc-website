
import { getPublicSupabase } from "../lib/supabasePublic";

export const revalidate = 3600;

const BASE_URL = "https://www.tbdfc.com";

const ACTIVE_POOLS = ["competitive", "training"];
const INCLUDED_POOLS = ["competitive", "training", "legacy"];

function normalize(code) {
  return typeof code === "string"
    ? code.trim().toUpperCase()
    : "";
}

function slugify(name) {
  return (name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function sitemap() {
  const { data, error } = await getPublicSupabase()
    .from("public_player_profiles")
    .select(
      "full_name, player_pool, nationality_code, nationality_code2"
    );

  if (error) {
    throw new Error(`Sitemap error: ${error.message}`);
  }

  const countryCodes = new Set();
  const playerSlugCounts = new Map();

  for (const player of data || []) {
    if (!INCLUDED_POOLS.includes(player.player_pool)) {
      continue;
    }

    // Collect current and historical countries.
    for (const rawCode of [
      player.nationality_code,
      player.nationality_code2,
    ]) {
      const code = normalize(rawCode);

      if (/^[A-Z]{2}$/.test(code)) {
        countryCodes.add(code.toLowerCase());
      }
    }

    // Only active players receive profile pages.
    if (ACTIVE_POOLS.includes(player.player_pool)) {
      const slug = slugify(player.full_name);

      if (slug) {
        playerSlugCounts.set(
          slug,
          (playerSlugCounts.get(slug) || 0) + 1
        );
      }
    }
  }

  const countryPages = [...countryCodes]
    .sort()
    .map((code) => ({
      url: `${BASE_URL}/countries/${code}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  // Exclude duplicate names because their current
  // profile URLs are ambiguous.
  const playerPages = [...playerSlugCounts.entries()]
    .filter(([slug, count]) => count === 1)
    .map(([slug]) => slug)
    .sort()
    .map((slug) => ({
      url: `${BASE_URL}/players/${slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...countryPages,
    ...playerPages,
  ];
}
