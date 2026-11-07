
import WorldMap from "./WorldMap";
import { getPublicSupabase } from "../lib/supabasePublic";

export default async function HomePage() {
  // Retrieve public player information from SquadOps.
  const { data, error } = await getPublicSupabase()
    .from("public_player_profiles")
    .select(
  "id, full_name, position, avatar_url, bio, highlight_url, nationality, nationality2, player_pool, nationality_code, nationality_code2"
);

  if (error) {
    throw new Error(
      `Unable to load public players: ${error.message}`
    );
  }

  // Competitive and training players count as active.
 
const activePlayers = (data || []).filter(
  (player) =>
    player.player_pool === "competitive" ||
    player.player_pool === "training"
);

const legacyPlayers = (data || []).filter(
  (player) => player.player_pool === "legacy"
);



  // Count unique countries represented by active players.
  // Include both primary and secondary nationalities.
  const activeNations = new Set();

  for (const player of activePlayers) {
    if (player.nationality_code) {
      activeNations.add(
        player.nationality_code.toUpperCase()
      );
    }

    if (player.nationality_code2) {
      activeNations.add(
        player.nationality_code2.toUpperCase()
      );
    }
  }

  return (
    <>
      {/* Header */}
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
            <div
              className="header-stat-num"
              id="stat-players"
            >
              {activePlayers.length}
            </div>
            <div className="header-stat-label">
              Players
            </div>
          </div>

          <div className="header-divider"></div>

          <div className="header-stat">
            <div
              className="header-stat-num"
              id="stat-nations"
            >
              {activeNations.size}
            </div>
            <div className="header-stat-label">
              Nations
            </div>
          </div>

          <div className="header-divider"></div>

          <div className="header-stat">
            <div
              className="header-stat-num"
              id="stat-subscribers"
            >
              0
            </div>
            <div className="header-stat-label">
              Following
            </div>
          </div>
        </div>
      </header>

      {/* Interactive World Map */}
      <div id="map-wrap">
        
<WorldMap
  players={activePlayers}
  legacyPlayers={legacyPlayers}
/>

      </div>

      {/* Country Tooltip */}
      <div id="tooltip">
        <div
          className="tooltip-country"
          id="tt-country"
        ></div>
        <div
          className="tooltip-stats"
          id="tt-stats"
        ></div>
      </div>

      {/* Country Panel */}
      <div id="side-panel">
        <div className="panel-header">
          <div className="panel-header-left">
            <div
              className="panel-flag"
              id="panel-flag"
            ></div>
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
          >
            ×
          </button>
        </div>

        <div
          className="panel-body"
          id="panel-body"
        ></div>
      </div>

      {/* Map Instructions */}
      <div id="tap-hint">
        Tap a glowing country to see players
      </div>
    </>
  );
}
