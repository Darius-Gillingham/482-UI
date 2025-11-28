// File: app/LatLongFetcher.tsx
// Commit: Normalize postal codes and improve Nominatim queries for accurate lat/lon lookup.

"use client";

import { useState, useEffect } from "react";

type LatLongFetcherProps = {
  state: string;
  city: string;
  postal: string;
  onLatChange: (value: number | null) => void;
  onLonChange: (value: number | null) => void;
};

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
        // Remove spaces for Canadian postal codes: "T4X 0B6" → "T4X0B6"
        const cleanPostal = postal.replace(/\s+/g, "");

        const params = new URLSearchParams({
          postalcode: cleanPostal,
          city: city,
          state: state,
          country: "Canada",
          format: "json"
        });

        const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

        const res = await fetch(url, {
          headers: {
            "User-Agent": "482-UI/1.0" // required by Nominatim rules
          }
        });

        if (!res.ok) {
          throw new Error("Lookup failed.");
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
        <p style={{ fontSize: "0.9rem", color: "#555" }}>Looking up location…</p>
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
