
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSupabase } from "../../../lib/supabasePublic";

export const dynamic = "force-dynamic";

const ACTIVE_POOLS = ["competitive", "training"];

function slugify(name) {
  return (name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function safeUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

async function getPlayer(slug) {
  const { data, error } = await getPublicSupabase()
    .from("public_player_profiles")
    .select(
      "id, full_name, avatar_url, position, nationality, nationality_code, nationality2, nationality_code2, bio, highlight_url, player_pool"
    );

  if (error) {
    throw new Error(`Player lookup failed: ${error.message}`);
  }

  const matches = (data || []).filter(
    (player) =>
      ACTIVE_POOLS.includes(player.player_pool) &&
      slugify(player.full_name) === slug
  );

  // Do not select the wrong player if two names match.
  return matches.length === 1 ? matches[0] : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const player = await getPlayer(slug);

  if (!player) {
    return {
      title: "Player Not Found | TBD FC",
      robots: { index: false },
    };
  }

  return {
    title: `${player.full_name} | TBD FC Internationals`,
    description: `${player.full_name} is a ${player.position || "player"} with TBD FC Internationals, an amateur soccer club based in Madison, Wisconsin.`,
  };
}

export default async function PlayerPage({ params }) {
  const { slug } = await params;
  const player = await getPlayer(slug);

  if (!player) {
    notFound();
  }

  const avatar = safeUrl(player.avatar_url);
  const highlights = safeUrl(player.highlight_url);

  const primaryCode = player.nationality_code
    ?.trim()
    .toLowerCase();

  return (
    <main
      className="public-player-page"
      style={{
        minHeight: "100vh",
        background: "#060608",
        color: "#f0ede8",
        padding: "40px 20px 90px",
        fontFamily: "Barlow, Arial, sans-serif",
      }}
    >
      <style>{`
        html:has(.public-player-page),
        body:has(.public-player-page) {
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
        <nav style={{ marginBottom: "45px" }}>
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
            marginBottom: "20px",
          }}
        >
          TBD FC INTERNATIONALS · PLAYER PROFILE
        </p>

        <section
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "30px",
            alignItems: "center",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "160px",
              height: "160px",
              border: "2px solid #D4AF37",
              borderRadius: "14px",
              overflow: "hidden",
              background: "#16161c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={`Portrait of ${player.full_name}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                style={{
                  color: "#D4AF37",
                  fontSize: "68px",
                }}
              >
                {player.full_name?.charAt(0) || "?"}
              </span>
            )}
          </div>

          <div style={{ flex: "1 1 250px" }}>
            <h1
              style={{
                color: "#D4AF37",
                fontSize: "clamp(32px, 6vw, 54px)",
                lineHeight: 1.1,
                marginBottom: "12px",
              }}
            >
              {player.full_name}
            </h1>

            <p
              style={{
                color: "#d0ccd0",
                fontSize: "18px",
              }}
            >
              {player.position || "Player"}
            </p>
          </div>
        </section>

        <section
          style={{
            background: "#16161c",
            border: "1px solid rgba(212,175,55,0.25)",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "28px",
          }}
        >
          <h2
            style={{
              fontSize: "21px",
              color: "#D4AF37",
              marginBottom: "18px",
            }}
          >
            National Representation
          </h2>

          {player.nationality && (
            <p style={{ marginBottom: "12px" }}>
              <strong>Primary:</strong>{" "}
              {primaryCode ? (
                <Link
                  href={`/countries/${primaryCode}`}
                  style={{ color: "#D4AF37" }}
                >
                  {player.nationality}
                </Link>
              ) : (
                player.nationality
              )}
            </p>
          )}

          {player.nationality2 && (
            <p style={{ color: "#b0b0c4" }}>
              <strong>Secondary:</strong>{" "}
              {player.nationality_code2 ? (
                <Link
                  href={`/countries/${player.nationality_code2.toLowerCase()}`}
                  style={{ color: "#b0b0c4" }}
                >
                  {player.nationality2}
                </Link>
              ) : (
                player.nationality2
              )}
            </p>
          )}
        </section>

        {player.bio && (
          <section style={{ marginBottom: "32px" }}>
            <h2
              style={{
                color: "#D4AF37",
                fontSize: "22px",
                marginBottom: "14px",
              }}
            >
              About
            </h2>

            <p
              style={{
                lineHeight: "1.8",
                fontSize: "16px",
                whiteSpace: "pre-line",
              }}
            >
              {player.bio}
            </p>
          </section>
        )}

        {highlights && (
          <a
            href={highlights}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              color: "#060608",
              background: "#D4AF37",
              padding: "12px 22px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Watch Highlights
          </a>
        )}
      </div>
    </main>
  );
}
