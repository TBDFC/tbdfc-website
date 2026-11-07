
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSupabase } from "../../../lib/supabasePublic";

export const dynamic = "force-dynamic";

const ACTIVE_POOLS = ["competitive", "training"];

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

function countryName(code) {
  try {
    return (
      new Intl.DisplayNames(["en"], {
        type: "region",
      }).of(code) || code
    );
  } catch {
    return code;
  }
}

async function getCountryData(code) {
  const { data, error } = await getPublicSupabase()
    .from("public_player_profiles")
    .select(
      "id, full_name, position, bio, player_pool, nationality_code, nationality_code2"
    );

  if (error) {
    throw new Error(`Country lookup failed: ${error.message}`);
  }

  const allPlayers = data || [];

  const activePlayers = allPlayers.filter((player) =>
    ACTIVE_POOLS.includes(player.player_pool)
  );

  // Prevent incorrect links if two players share a name.
  const slugCounts = new Map();

  for (const player of activePlayers) {
    const slug = slugify(player.full_name);

    if (slug) {
      slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
    }
  }

  const countryPlayers = allPlayers.filter(
    (player) =>
      normalize(player.nationality_code) === code ||
      normalize(player.nationality_code2) === code
  );

  const primary = countryPlayers.filter(
    (player) =>
      ACTIVE_POOLS.includes(player.player_pool) &&
      normalize(player.nationality_code) === code
  );

  const secondary = countryPlayers.filter(
    (player) =>
      ACTIVE_POOLS.includes(player.player_pool) &&
      normalize(player.nationality_code2) === code &&
      normalize(player.nationality_code) !== code
  );

  const historical = countryPlayers.filter(
    (player) => player.player_pool === "legacy"
  );

  return { primary, secondary, historical, slugCounts };
}

export async function generateMetadata({ params }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    return {
      title: "Country Not Found | TBD FC",
      robots: { index: false },
    };
  }

  const country = countryName(code);

  return {
    title: `${country} | TBD FC Internationals`,
    description: `Explore current and former TBD FC players representing ${country}, part of an international amateur soccer club in Madison, Wisconsin.`,
  };
}

export default async function CountryPage({ params }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    notFound();
  }

  const {
    primary,
    secondary,
    historical,
    slugCounts,
  } = await getCountryData(code);

  if (
    primary.length === 0 &&
    secondary.length === 0 &&
    historical.length === 0
  ) {
    notFound();
  }

  const country = countryName(code);

  function renderPlayerCard(player) {
    const slug = slugify(player.full_name);
    const hasProfile =
      slug && slugCounts.get(slug) === 1;

    const nameStyle = {
      color: "#D4AF37",
      fontSize: "18px",
      fontWeight: "bold",
      textDecoration: "none",
    };

    return (
      <article
        key={player.id}
        style={{
          padding: "18px",
          background: "#16161c",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: "10px",
          marginBottom: "12px",
        }}
      >
        <h3 style={{ marginBottom: "6px" }}>
          {hasProfile ? (
            <Link
              href={`/players/${slug}`}
              style={nameStyle}
            >
              {player.full_name}
            </Link>
          ) : (
            <span style={nameStyle}>
              {player.full_name}
            </span>
          )}
        </h3>

        <p
          style={{
            color: "#b0b0c4",
            fontSize: "14px",
          }}
        >
          {player.position || "Player"}
        </p>

        {player.bio && (
          <p
            style={{
              marginTop: "10px",
              fontSize: "14px",
              lineHeight: "1.6",
              color: "#d0ccd0",
              whiteSpace: "pre-line",
            }}
          >
            {player.bio}
          </p>
        )}

        {hasProfile && (
          <Link
            href={`/players/${slug}`}
            style={{
              display: "inline-block",
              marginTop: "14px",
              color: "#D4AF37",
              fontSize: "13px",
              textDecoration: "underline",
            }}
          >
            View Player Profile →
          </Link>
        )}
      </article>
    );
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

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
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

            {primary.map(renderPlayerCard)}
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

            {secondary.map(renderPlayerCard)}
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

            {historical.map((player) => (
              <div
                key={player.id}
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
