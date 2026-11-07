
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSupabase } from "../../../lib/supabasePublic";

const ACTIVE_POOLS = ["competitive", "training"];

function normalize(code) {
  return typeof code === "string"
    ? code.trim().toUpperCase()
    : "";
}

function countryName(code) {
  try {
    return new Intl.DisplayNames(["en"], {
      type: "region",
    }).of(code) || code;
  } catch {
    return code;
  }
}

async function getCountryData(code) {
  const { data, error } = await getPublicSupabase()
    .from("public_player_profiles")
    .select(
      "full_name, position, bio, player_pool, nationality_code, nationality_code2"
    );

  if (error) {
    throw new Error(error.message);
  }

  const countryPlayers = (data || []).filter(
    (player) =>
      normalize(player.nationality_code) === code ||
      normalize(player.nationality_code2) === code
  );

  const active = countryPlayers.filter(
    (player) => ACTIVE_POOLS.includes(player.player_pool)
  );

  const historical = countryPlayers.filter(
    (player) => player.player_pool === "legacy"
  );

  return { active, historical };
}

export async function generateMetadata({ params }) {
  const { code } = await params;
  const country = countryName(code.toUpperCase());

  return {
    title: `${country} | TBD FC Internationals`,
    description: `Explore players representing ${country} at TBD FC Internationals, an amateur soccer club in Madison, Wisconsin.`,
  };
}

export default async function CountryPage({ params }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    notFound();
  }

  const { active, historical } = await getCountryData(code);

  if (active.length === 0 && historical.length === 0) {
    notFound();
  }

  const country = countryName(code);

  const primary = active.filter(
    (player) => normalize(player.nationality_code) === code
  );

  const secondary = active.filter(
    (player) =>
      normalize(player.nationality_code2) === code &&
      normalize(player.nationality_code) !== code
  );

  function renderPlayers(list) {
    return list.map((player, index) => (
      <article
        key={`${player.full_name}-${index}`}
        style={{
          padding: "18px",
          background: "#16161c",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: "10px",
          marginBottom: "12px",
        }}
      >
        <h3 style={{ fontSize: "18px", marginBottom: "5px" }}>
          {player.full_name}
        </h3>

        <p style={{ color: "#b0b0c4", fontSize: "14px" }}>
          {player.position || "Player"}
        </p>

        {player.bio && (
          <p
            style={{
              marginTop: "10px",
              fontSize: "14px",
              lineHeight: "1.6",
              color: "#d0ccd0",
            }}
          >
            {player.bio}
          </p>
        )}
      </article>
    ));
  }

  return (
    <main
      className="country-detail-page"
      style={{
        minHeight: "100vh",
        background: "#060608",
        color: "#f0ede8",
        padding: "40px 20px 80px",
        fontFamily: "Barlow, Arial, sans-serif",
      }}
    >
      <style>{`
        html:has(.country-detail-page),
        body:has(.country-detail-page) {
          overflow: auto;
          touch-action: auto;
        }
      `}</style>

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <nav style={{ marginBottom: "50px" }}>
          <Link
            href="/"
            style={{
              color: "#D4AF37",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← Back to TBD FC World Map
          </Link>
        </nav>

        <p
          style={{
            color: "#D4AF37",
            letterSpacing: "3px",
            fontSize: "12px",
            marginBottom: "12px",
          }}
        >
          TBD FC INTERNATIONALS
        </p>

        <h1
          style={{
            fontSize: "clamp(36px, 7vw, 64px)",
            color: "#D4AF37",
            marginBottom: "12px",
          }}
        >
          {country}
        </h1>

        <p
          style={{
            color: "#b0b0c4",
            lineHeight: "1.6",
            marginBottom: "40px",
          }}
        >
          {country} is represented in the international
          community of TBD FC, an amateur soccer club
          based in Madison, Wisconsin.
        </p>

        {primary.length > 0 && (
          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ marginBottom: "18px" }}>
              Current Players
            </h2>
            {renderPlayers(primary)}
          </section>
        )}

        {secondary.length > 0 && (
          <section style={{ marginBottom: "36px" }}>
            <h2
              style={{
                color: "#b0b0c4",
                marginBottom: "18px",
              }}
            >
              Secondary Nationality
            </h2>
            {renderPlayers(secondary)}
          </section>
        )}

        {historical.length > 0 && (
          <section style={{ marginBottom: "36px" }}>
            <h2
              style={{
                color: "#A78BFA",
                marginBottom: "18px",
              }}
            >
              Former Players
            </h2>

            {historical.map((player, index) => (
              <div
                key={`${player.full_name}-${index}`}
                style={{
                  background: "#16161c",
                  border: "1px solid rgba(109,40,217,0.4)",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  marginBottom: "10px",
                }}
              >
                {player.full_name}
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
