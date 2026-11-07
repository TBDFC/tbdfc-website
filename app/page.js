
import Link from "next/link";
import WorldMap from "./WorldMap";
import { getPublicSupabase } from "../lib/supabasePublic";

export const dynamic = "force-dynamic";

const ACTIVE_POOLS = ["competitive", "training"];

function normalize(code) {
  return typeof code === "string"
    ? code.trim().toUpperCase()
    : "";
}

export default async function HomePage() {
  // Load approved public SquadOps profiles.
  const { data, error } = await getPublicSupabase()
    .from("public_player_profiles")
    .select(
      "id, full_name, position, avatar_url, bio, highlight_url, nationality, nationality2, player_pool, nationality_code, nationality_code2"
    );

  if (error) {
    throw new Error(`Unable to load players: ${error.message}`);
  }

  const publicPlayers = data || [];

  // Separate active and historical players.
  const activePlayers = publicPlayers.filter((player) =>
    ACTIVE_POOLS.includes(player.player_pool)
  );

  const legacyPlayers = publicPlayers.filter(
    (player) => player.player_pool === "legacy"
  );

  // Count current nations.
  const activeNations = new Set();

  for (const player of activePlayers) {
    for (const rawCode of [
      player.nationality_code,
      player.nationality_code2,
    ]) {
      const code = normalize(rawCode);

      if (/^[A-Z]{2}$/.test(code)) {
        activeNations.add(code);
      }
    }
  }

  // Build the country directory from active and Legacy players.
  const allCountries = new Set();

  for (const player of [...activePlayers, ...legacyPlayers]) {
    for (const rawCode of [
      player.nationality_code,
      player.nationality_code2,
    ]) {
      const code = normalize(rawCode);

      if (/^[A-Z]{2}$/.test(code)) {
        allCountries.add(code);
      }
    }
  }

  const displayNames = new Intl.DisplayNames(["en"], {
    type: "region",
  });

  const countryDirectory = [...allCountries]
    .map((code) => ({
      code,
      name: displayNames.of(code) || code,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {/* HEADER */}
      <header>
        <div className="logo">
          <img
            src="/TBDFC_Logo_Official.png"
            alt="TBD FC"
          />

          <div className="logo-text">
            <div className="logo-name">TBD FC</div>
            <div className="logo-sub">
              Internationals · Madison, WI
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="header-stat">
            <div className="header-stat-num" id="stat-players">
              {activePlayers.length}
            </div>
            <div className="header-stat-label">
              Players
            </div>
          </div>

          <div className="header-divider"></div>

          <div className="header-stat">
            <div className="header-stat-num" id="stat-nations">
              {activeNations.size}
            </div>
            <div className="header-stat-label">
              Nations
            </div>
          </div>

          <div className="header-divider"></div>

          <div className="header-stat">
            <div className="header-stat-num" id="stat-subscribers">
              0
            </div>
            <div className="header-stat-label">
              Following
            </div>
          </div>
        </div>
      </header>

      {/* INTERACTIVE MAP */}
      <div id="map-wrap">
        <WorldMap
          players={activePlayers}
          legacyPlayers={legacyPlayers}
        />
      </div>

      {/* TOOLTIP */}
      <div id="tooltip">
        <div className="tooltip-country" id="tt-country"></div>
        <div className="tooltip-stats" id="tt-stats"></div>
      </div>

      {/* COUNTRY PANEL */}
      <div id="side-panel">
        <div className="panel-header">
          <div className="panel-header-left">
            <div className="panel-flag" id="panel-flag"></div>

            <div
              className="panel-country-name"
              id="panel-country"
            ></div>

            <div className="panel-counts">
              <div className="panel-count">
                <div
                  className="panel-count-num"
                  id="panel-player-count"
                >
                  0
                </div>
                <div className="panel-count-label">
                  Players
                </div>
              </div>

              <div className="panel-divider"></div>

              <div className="panel-count">
                <div
                  className="panel-count-num"
                  id="panel-sub-count"
                >
                  0
                </div>
                <div className="panel-count-label">
                  Followers
                </div>
              </div>
            </div>
          </div>

          <button
            className="panel-close"
            id="panel-close"
            type="button"
            aria-label="Close country panel"
          >
            ×
          </button>
        </div>

        <div className="panel-body" id="panel-body"></div>
      </div>

      {/* MAP INSTRUCTIONS */}
      <div id="tap-hint">
        Tap a glowing country to see players
      </div>

      {/* SEARCHABLE COUNTRY DIRECTORY */}
      <nav
        aria-label="Country directory"
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 250,
        }}
      >
        <details style={{ position: "relative" }}>
          <summary
            style={{
              display: "inline-block",
              cursor: "pointer",
              padding: "10px 16px",
              border: "1px solid rgba(212,175,55,0.35)",
              borderRadius: "22px",
              background: "rgba(14,14,18,0.96)",
              color: "#D4AF37",
              fontSize: "12px",
              fontFamily: "Barlow, Arial, sans-serif",
              userSelect: "none",
            }}
          >
            Browse Countries
          </summary>

          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: 0,
              width: "min(360px, calc(100vw - 40px))",
              maxHeight: "65vh",
              overflowY: "auto",
              touchAction: "pan-y",
              background: "#101014",
              border: "1px solid rgba(212,175,55,0.3)",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
            }}
          >
            <h2
              style={{
                color: "#D4AF37",
                fontSize: "18px",
                marginBottom: "6px",
              }}
            >
              Our International Community
            </h2>

            <p
              style={{
                color: "#b0b0c4",
                fontSize: "12px",
                lineHeight: "1.5",
                marginBottom: "16px",
              }}
            >
              Explore the nations represented by current
              and former TBD FC players.
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {countryDirectory.map((country) => (
                <li key={country.code}>
                  <Link
                    href={`/countries/${country.code.toLowerCase()}`}
                    style={{
                      color: "#f0ede8",
                      fontSize: "13px",
                      textDecoration: "none",
                      lineHeight: "1.4",
                      display: "block",
                    }}
                  >
                    {country.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </nav>
    </>
  );
}
