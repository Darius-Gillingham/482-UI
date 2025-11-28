// File: app/page.tsx
// Commit: Integrate LocationSelect, LatLongFetcher, postal code, and pass lat/lon into search request.

"use client";

import { useState } from "react";
import LocationSelect from "./LocationSelect";
import LatLongFetcher from "./LatLongFetcher";
import { QueryBox } from "./QueryBox";
import { LoadingBar } from "./LoadingBar";
import { CategoryPillStream } from "./CategoryPillStream";
import { RestaurantResults } from "./RestaurantResults";

export type CategoryPrediction = {
  label: string;
  confidence: number;
};

export type RestaurantPrediction = {
  id: string;
  name: string;
  city: string;
  score: number;
};

export default function Page() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPostal, setSelectedPostal] = useState("");

  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  const [categories, setCategories] = useState<CategoryPrediction[]>([]);
  const [totalCategories, setTotalCategories] = useState<number | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(query: string) {
    const trimmed = query.trim();

    if (!trimmed) {
      setError("Please enter what you're craving.");
      return;
    }

    if (!selectedState || !selectedCity || !selectedPostal) {
      setError("Please select state, city, and postal code.");
      return;
    }

    if (lat === null || lon === null) {
      setError("Coordinates not available for this postal code.");
      return;
    }

    setLoading(true);
    setError(null);
    setCategories([]);
    setRestaurants([]);
    setTotalCategories(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          state: selectedState,
          city: selectedCity,
          postal: selectedPostal,
          lat: lat,
          lon: lon
        })
      });

      if (!res.ok || !res.body) {
        throw new Error("Search failed.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex = buffer.indexOf("\n");
        while (newlineIndex !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line.length > 0) {
            const msg = JSON.parse(line);

            if (msg.type === "count") {
              setTotalCategories(msg.total);
            }

            if (msg.type === "category") {
              setCategories((prev) => [
                ...prev,
                { label: msg.label, confidence: msg.confidence }
              ]);
            }

            if (msg.type === "results") {
              setRestaurants(msg.restaurants || []);
            }
          }

          newlineIndex = buffer.indexOf("\n");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  const loadedCount = categories.length;
  const total = totalCategories ?? 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 1rem",
        maxWidth: "900px",
        margin: "0 auto"
      }}
    >
      <LocationSelect
        onStateChange={setSelectedState}
        onCityChange={setSelectedCity}
        onPostalChange={setSelectedPostal}
      />

      <LatLongFetcher
        state={selectedState}
        city={selectedCity}
        postal={selectedPostal}
        onLatChange={setLat}
        onLonChange={setLon}
      />

      <section
        style={{
          width: "100%",
          marginBottom: "1.5rem",
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          border: "1px solid rgba(0,0,0,0.05)"
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            marginBottom: "0.75rem"
          }}
        >
          What are you craving?
        </h1>

        <QueryBox onSubmit={handleSearch} disabled={loading} />

        {error && (
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.9rem",
              color: "#b91c1c"
            }}
          >
            {error}
          </p>
        )}
      </section>

      {loading && total > 0 && (
        <div style={{ width: "100%", maxWidth: "720px", marginBottom: "1rem" }}>
          <LoadingBar current={loadedCount} total={total} />
        </div>
      )}

      {categories.length > 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: "720px",
            marginBottom: "1.5rem",
            padding: "1rem",
            backgroundColor: "#f9fafb",
            borderRadius: "0.75rem",
            border: "1px solid rgba(0,0,0,0.06)"
          }}
        >
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            Predicted Categories
          </h2>
          <CategoryPillStream categories={categories} />
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "720px", marginBottom: "2rem" }}>
        <RestaurantResults restaurants={restaurants} />
      </div>
    </main>
  );
}
