
import { getPublicSupabase } from "../lib/supabasePublic";

export const revalidate = 3600;

const BASE_URL = "https://www.tbdfc.com";

const INCLUDED_POOLS = [
  "competitive",
  "training",
  "legacy",
];

export default async function sitemap() {
  const { data, error } = await getPublicSupabase()
    .from("public_player_profiles")
    .select(
      "player_pool, nationality_code, nationality_code2"
    );

  if (error) {
    throw new Error(`Sitemap error: ${error.message}`);
  }

  const countryCodes = new Set();

  for (const player of data || []) {
    if (!INCLUDED_POOLS.includes(player.player_pool)) {
      continue;
    }

    for (const code of [
      player.nationality_code,
      player.nationality_code2,
    ]) {
      if (
        typeof code === "string" &&
        /^[A-Z]{2}$/.test(code.trim().toUpperCase())
      ) {
        countryCodes.add(code.trim().toLowerCase());
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

  return [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...countryPages,
  ];
}
