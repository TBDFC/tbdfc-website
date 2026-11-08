
/*
 * TBD FC Internationals
 * Historical Player Registry
 *
 * Former players without required SquadOps accounts.
 *
 * Primary and secondary nationality codes use ISO 3166-1.
 * Historical representation has lower map priority than
 * active primary or secondary representation.
 */

export const historicalPlayers = [
  {
    full_name: "Bryan Silver",
    nationality_code: "US",
    nationality_code2: null,
  },
  {
    full_name: "Ousman Jallow",
    nationality_code: "GM",
    nationality_code2: null,
  },
  {
    full_name: "Abdu Jeng",
    nationality_code: "GM",
    nationality_code2: null,
  },
  {
    full_name: "Sulayman Njie",
    nationality_code: "GM",
    nationality_code2: null,
  },
  {
    full_name: "Jose Gutierrez",
    nationality_code: "MX",
    nationality_code2: null,
  },
  {
    full_name: "Christian Aguayo",
    nationality_code: "MX",
    nationality_code2: "US",
  },
  {
    full_name: "Natan Lidukhover",
    nationality_code: "US",
    nationality_code2: "UA",
  },
  {
    full_name: "Solomon Davis",
    nationality_code: "US",
    nationality_code2: null,
  },
  {
    full_name: "Arthur Ho",
    nationality_code: "HK",
    nationality_code2: null,
  },
  {
    full_name: "Jean Paul Garcia",
    nationality_code: "ES",
    nationality_code2: null,
  },
  {
    full_name: "Erik Mahkatadze",
    nationality_code: "GE",
    nationality_code2: "ES",
  },
  {
    full_name: "Jamie O'Connell",
    nationality_code: "IE",
    nationality_code2: null,
  },
].map((player, index) => ({
  ...player,
  id: `historical-${index + 1}`,
  player_pool: "legacy",
}));

// Former staff are recorded separately.
// They do not count as players on the nationality map.
export const historicalStaff = [
  {
    full_name: "John Elliott",
    role: "Assistant Coach",
    nationality: "Northern Ireland",
  },
];

// Prevent duplicate names when combining this list
// with existing SquadOps Legacy profiles.
export function mergeHistoricalPlayers(squadOpsPlayers = []) {
  const combined = [...squadOpsPlayers];

  function normalizeName(name) {
    return (name || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  const existingNames = new Set(
    combined.map((player) => normalizeName(player.full_name))
  );

  for (const player of historicalPlayers) {
    const name = normalizeName(player.full_name);

    if (!existingNames.has(name)) {
      combined.push(player);
      existingNames.add(name);
    }
  }

  return combined;
}
