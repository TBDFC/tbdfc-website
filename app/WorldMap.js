
"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { numToAlpha2 } from "../lib/countryCodes";

export default function WorldMap({
  players = [],
  legacyPlayers = [],
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(mapRef.current);
    let mounted = true;
    let countryLayer = null;

    const mapWrap = document.getElementById("map-wrap");
    const sidePanel = document.getElementById("side-panel");
    const panelBody = document.getElementById("panel-body");
    const closeButton = document.getElementById("panel-close");
    const tooltip = document.getElementById("tooltip");
    const hint = document.getElementById("tap-hint");

    const GOLD = "#D4AF37";
    const SILVER = "#b0b0c4";
    const PURPLE = "#6D28D9";
    const PURPLE_HOVER = "#7C3AED";

    const primaryCountries = new Set();
    const secondaryCountries = new Set();
    const historicalCountries = new Set();

    function normalize(code) {
      return typeof code === "string"
        ? code.trim().toUpperCase()
        : "";
    }

    for (const player of players) {
      const primary = normalize(player.nationality_code);
      const secondary = normalize(player.nationality_code2);

      if (primary) primaryCountries.add(primary);
      if (secondary) secondaryCountries.add(secondary);
    }

    for (const player of legacyPlayers) {
      const primary = normalize(player.nationality_code);
      const secondary = normalize(player.nationality_code2);

      if (primary) historicalCountries.add(primary);
      if (secondary) historicalCountries.add(secondary);
    }

    function getCountryType(code) {
      if (primaryCountries.has(code)) return "active";
      if (secondaryCountries.has(code)) return "heritage";
      if (historicalCountries.has(code)) return "legacy";
      return "inactive";
    }

    function getCountryCode(country) {
      const numericCode = String(country.id).padStart(3, "0");
      return numToAlpha2[numericCode] || "";
    }

    function countryFlag(code) {
      if (!/^[A-Z]{2}$/.test(code)) return "";

      return [...code]
        .map((letter) =>
          String.fromCodePoint(letter.charCodeAt(0) + 127397)
        )
        .join("");
    }

    function makeElement(tag, className, text) {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    }

    function getCountryPlayers(code) {
      const primary = players.filter(
        (p) => normalize(p.nationality_code) === code
      );

      const secondary = players.filter(
        (p) =>
          normalize(p.nationality_code2) === code &&
          normalize(p.nationality_code) !== code
      );

      const historical = legacyPlayers.filter(
        (p) =>
          normalize(p.nationality_code) === code ||
          normalize(p.nationality_code2) === code
      );

      return { primary, secondary, historical };
    }

    function addPlayerCard(player, isSecondary, flag) {
      const card = makeElement("div", "player-card");

      card.style.borderColor = isSecondary
        ? "rgba(176,176,196,0.5)"
        : "rgba(212,175,55,0.3)";

      const avatar = makeElement("div", "player-avatar");
      avatar.style.borderColor = isSecondary ? SILVER : GOLD;

      if (player.avatar_url) {
        const image = document.createElement("img");
        image.src = player.avatar_url;
        image.alt = player.full_name || "Player";
        image.loading = "lazy";
        avatar.appendChild(image);
      } else {
        const initial = makeElement(
          "div",
          "player-initial",
          (player.full_name || "?").charAt(0)
        );

        initial.style.color = isSecondary ? SILVER : GOLD;
        avatar.appendChild(initial);
      }

      const info = makeElement("div", "player-info");

      info.appendChild(
        makeElement(
          "div",
          "player-name",
          player.full_name || "Player"
        )
      );

      const position = makeElement(
        "div",
        "player-position",
        `${flag} ${player.position || "Player"}`
      );

      if (isSecondary) position.style.color = SILVER;
      info.appendChild(position);

      if (player.bio) {
        info.appendChild(
          makeElement("div", "player-bio", `"${player.bio}"`)
        );
      }

      if (player.highlight_url) {
        try {
          const url = new URL(player.highlight_url);

          if (
            url.protocol === "https:" ||
            url.protocol === "http:"
          ) {
            const link = makeElement(
              "a",
              "player-highlight",
              "🎬 Highlights"
            );

            link.href = url.href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            info.appendChild(link);
          }
        } catch {
          // Skip invalid highlight links.
        }
      }

      card.appendChild(avatar);
      card.appendChild(info);
      panelBody.appendChild(card);
    }

    function addLegacyPlayer(player) {
      const row = makeElement("div", "player-card");
      row.style.borderColor = "rgba(109,40,217,0.4)";
      row.style.padding = "14px";

      const info = makeElement("div", "player-info");

      const name = makeElement(
        "div",
        "player-name",
        player.full_name || "Former Player"
      );

      info.appendChild(name);
      row.appendChild(info);
      panelBody.appendChild(row);
    }

    function addSectionTitle(text, color, marginTop) {
      const title = makeElement(
        "div",
        "panel-section-title",
        text
      );

      if (color) title.style.color = color;
      if (marginTop) title.style.marginTop = "20px";

      panelBody.appendChild(title);
    }

    function openCountry(code, countryName) {
      const { primary, secondary, historical } =
        getCountryPlayers(code);

      const total =
        primary.length + secondary.length + historical.length;

      if (!total) return;

      const flag = countryFlag(code);
      const type = getCountryType(code);

      document.getElementById("panel-flag").textContent =
        flag || code;

      const nameElement = document.getElementById("panel-country");
      nameElement.textContent = countryName;

      nameElement.style.color =
        type === "legacy" ? "#A78BFA" : GOLD;

      document.getElementById("panel-player-count").textContent =
        total;

      document.getElementById("panel-sub-count").textContent =
        "0";

      panelBody.replaceChildren();

      if (primary.length) {
        addSectionTitle("Players");

        primary.forEach((p) =>
          addPlayerCard(p, false, flag)
        );
      }

      if (secondary.length) {
        addSectionTitle(
          "Secondary Nationality",
          SILVER,
          primary.length > 0
        );

        secondary.forEach((p) =>
          addPlayerCard(p, true, flag)
        );
      }

      if (historical.length) {
        addSectionTitle(
          "Former Players",
          "#A78BFA",
          primary.length + secondary.length > 0
        );

        historical.forEach(addLegacyPlayer);
      }

      sidePanel.classList.add("open");
      mapWrap.classList.add("panel-open");
      hint.classList.add("hidden");
      tooltip.classList.remove("visible");
    }

    function closeCountry() {
      sidePanel.classList.remove("open");
      mapWrap.classList.remove("panel-open");
      tooltip.classList.remove("visible");
    }

    closeButton.addEventListener("click", closeCountry);

    function dimensions() {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }

    const { width, height } = dimensions();

    const projection = d3
      .geoNaturalEarth1()
      .scale(width / 6.2)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    function resizeMap() {
      const { width, height } = dimensions();

      svg.attr("viewBox", `0 0 ${width} ${height}`);

      projection
        .scale(width / 6.2)
        .translate([width / 2, height / 2]);

      if (countryLayer) {
        countryLayer.selectAll("path").attr("d", path);
      }
    }

    async function loadMap() {
      try {
        const response = await fetch(
          "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
        );

        if (!response.ok) {
          throw new Error("Map download failed");
        }

        const world = await response.json();

        if (!mounted) return;

        const countries = feature(
          world,
          world.objects.countries
        ).features;

        countryLayer = svg
          .append("g")
          .attr("class", "countries-layer");

        countryLayer
          .selectAll("path")
          .data(countries)
          .join("path")
          .attr("class", (country) => {
            return `country ${getCountryType(getCountryCode(country))}`;
          })
          .attr("d", path)
          .style("fill", (country) => {
            return getCountryType(getCountryCode(country)) === "legacy"
              ? PURPLE
              : null;
          })
          .style("filter", (country) => {
            return getCountryType(getCountryCode(country)) === "legacy"
              ? "none"
              : null;
          })
          .style("cursor", (country) => {
            return getCountryType(getCountryCode(country)) === "inactive"
              ? "default"
              : "pointer";
          })
          .on("click", (event, country) => {
            const code = getCountryCode(country);

            if (getCountryType(code) === "inactive") return;

            const countryName = country.properties?.name || code;
            openCountry(code, countryName);
          })
          .on("mousemove", (event, country) => {
            if (window.innerWidth < 768) return;
            if (sidePanel.classList.contains("open")) return;

            const code = getCountryCode(country);
            const type = getCountryType(code);

            if (type === "inactive") {
              tooltip.classList.remove("visible");
              return;
            }

            const countryName = country.properties?.name || code;

            const { primary, secondary, historical } =
              getCountryPlayers(code);

            const total =
              primary.length +
              secondary.length +
              historical.length;

            document.getElementById("tt-country").textContent =
              countryName;

            document.getElementById("tt-stats").textContent =
              `${total} player${total === 1 ? "" : "s"}`;

            tooltip.style.left = `${event.clientX + 14}px`;
            tooltip.style.top = `${event.clientY - 40}px`;
            tooltip.classList.add("visible");
          })
          .on("mouseenter", function (event, country) {
            const code = getCountryCode(country);

            if (getCountryType(code) === "legacy") {
              d3.select(this).style("fill", PURPLE_HOVER);
            }
          })
          .on("mouseleave", function (event, country) {
            tooltip.classList.remove("visible");

            const code = getCountryCode(country);

            if (getCountryType(code) === "legacy") {
              d3.select(this).style("fill", PURPLE);
            }
          });

        const zoom = d3
          .zoom()
          .scaleExtent([1, 8])
          .on("zoom", (event) => {
            countryLayer.attr(
              "transform",
              event.transform
            );
          });

        svg.call(zoom);
        window.addEventListener("resize", resizeMap);
      } catch (error) {
        if (mounted) {
          console.error("World map error:", error);
        }
      }
    }

    loadMap();

    return () => {
      mounted = false;
      closeButton.removeEventListener("click", closeCountry);
      window.removeEventListener("resize", resizeMap);
      svg.on(".zoom", null);
      svg.selectAll("*").remove();
    };
  }, [players, legacyPlayers]);

  return (
    <svg
      id="world-map"
      ref={mapRef}
      role="img"
      aria-label="Interactive map of current and historical TBD FC nationalities"
    />
  );
}
