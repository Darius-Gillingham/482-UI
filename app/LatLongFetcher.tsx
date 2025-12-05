// File: app/LatLongFetcher.tsx
// Commit: Fix Nominatim lookups by choosing country per state and keeping Canadian postal normalization.

// NOTE: This is a client component; it fetches lat/lon directly from Nominatim
// based on the selected state, city, and postal code.

"use client";

import { useState, useEffect } from "react";

type LatLongFetcherProps = {
  state: string;
  city: string;
  postal: string;
  onLatChange: (value: number | null) => void;
  onLonChange: (value: number | null) => void;
};

// Canadian province/territory codes (two-letter) used in your dataset.
const CANADIAN_PROVINCES = new Set([
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU",
  "ON", "PE", "QC", "SK", "YT"
]);

export default function LatLongFetcher({
  state,
  city,
  postal,
  onLatChange,
  onLonChange
}: LatLongFetcherProps) {
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset when inputs are incomplete
    if (!state || !city || !postal) {
      setLat(null);
      setLon(null);
      setError(null);
      onLatChange(null);
      onLonChange(null);
      return;
    }

    async function fetchLatLon() {
      setLoading(true);
      setError(null);

      try {
        // Decide country based on state code.
        // - Canadian provinces → "ca"
        // - Everything else (your US states) → "us"
        const isCanada = CANADIAN_PROVINCES.has(state.toUpperCase());
        const countryCode = isCanada ? "ca" : "us";

        let normalizedPostal = postal.trim();

        if (isCanada) {
          // Your Canadian entries come in as "T5A 0A4", etc.
          // Nominatim accepts both; you’ve empirically seen that
          // stripping spaces works, so keep that behavior.
          normalizedPostal = normalizedPostal.replace(/\s+/g, "");
        } else {
          // US ZIPs: just strip outer whitespace, keep digits as-is.
          // e.g. "85706" stays "85706".
          normalizedPostal = normalizedPostal.replace(/\s+/g, "");
        }

        const params = new URLSearchParams({
          postalcode: normalizedPostal,
          city: city,
          state: state,
          // Nominatim prefers "countrycodes" (ISO-3166 alpha-2).
          countrycodes: countryCode,
          format: "json"
        });

        const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

        const res = await fetch(url, {
          headers: {
            // Nominatim requires a valid UA string.
            "User-Agent": "482-UI/1.0 (student project)"
          }
        });

        if (!res.ok) {
          throw new Error(`Lookup failed with status ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          setLat(null);
          setLon(null);
          onLatChange(null);
          onLonChange(null);
          setError("No coordinate match for this postal code.");
          setLoading(false);
          return;
        }

        const first = data[0];
        const latNum = Number(first.lat);
        const lonNum = Number(first.lon);

        if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
          throw new Error("Invalid coordinates returned from lookup.");
        }

        setLat(latNum);
        setLon(lonNum);
        onLatChange(latNum);
        onLonChange(lonNum);
      } catch (err) {
        setError("Error fetching coordinates.");
        setLat(null);
        setLon(null);
        onLatChange(null);
        onLonChange(null);
      }

      setLoading(false);
    }

    fetchLatLon();
  }, [state, city, postal, onLatChange, onLonChange]);

  return (
    <div
      style={{
        width: "100%",
        marginBottom: "1.25rem",
        padding: "1rem",
        borderRadius: "0.75rem",
        backgroundColor: "#fafafa",
        border: "1px solid rgba(0,0,0,0.08)"
      }}
    >
      <h3
        style={{
          fontSize: "1rem",
          marginBottom: "0.5rem",
          fontWeight: 600
        }}
      >
        Coordinates
      </h3>

      {loading && (
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Looking up location…
        </p>
      )}

      {error && (
        <p style={{ fontSize: "0.9rem", color: "#b91c1c" }}>{error}</p>
      )}

      {!loading && !error && lat !== null && lon !== null && (
        <p style={{ fontSize: "0.95rem", color: "#111" }}>
          Latitude: <strong>{lat.toFixed(6)}</strong>
          <br />
          Longitude: <strong>{lon.toFixed(6)}</strong>
        </p>
      )}

      {!loading && !error && lat === null && lon === null && (
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          Select state → city → postal code to view coordinates.
        </p>
      )}
    </div>
  );
}
