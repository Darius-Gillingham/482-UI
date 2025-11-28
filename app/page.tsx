// File: src/app/page.tsx
// Commit: Add streaming restaurant search UI with query box, loading bar, categories, and results.

"use client";

import React, { useState } from "react";
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
  const [categories, setCategories] = useState<CategoryPrediction[]>([]);
  const [totalCategories, setTotalCategories] = useState<number | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(query: string): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter what you're craving.");
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
          // Location can be wired later; for now these are null.
          lat: null,
          lon: null,
        }),
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
            const message = JSON.parse(line) as
              | { type: "count"; total: number }
              | { type: "category"; label: string; confidence: number }
              | {
                  type: "results";
                  restaurants: RestaurantPrediction[];
                };

            if (message.type === "count") {
              setTotalCategories(message.total);
            } else if (message.type === "category") {
              setCategories((prev) => [
                ...prev,
                {
                  label: message.label,
                  confidence: message.confidence,
                },
              ]);
            } else if (message.type === "results") {
              setRestaurants(message.restaurants || []);
            }
          }

          newlineIndex = buffer.indexOf("\n");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error during search."
      );
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
        maxWidth: "960px",
        margin: "0 auto",
        fontFamily:
          '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.05)",
          backgroundColor: "#ffffff",
          marginBottom: "1.5rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            marginBottom: "0.75rem",
            fontFamily:
              '"DM Serif Display", "Times New Roman", ui-serif, Georgia, serif',
          }}
        >
          What are you craving?
        </h1>
        <p style={{ marginBottom: "1rem", fontSize: "0.95rem", opacity: 0.8 }}>
          Describe the meal you want, and we&apos;ll match it to nearby
          restaurants.
        </p>
        <QueryBox onSubmit={handleSearch} disabled={loading} />
        {error && (
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.9rem",
              color: "#b91c1c",
            }}
          >
            {error}
          </p>
        )}
      </section>

      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          marginBottom: "1.5rem",
        }}
      >
        {loading && total > 0 && (
          <div style={{ marginBottom: "0.75rem" }}>
            <LoadingBar current={loadedCount} total={total} />
          </div>
        )}

        {categories.length > 0 && (
          <div
            style={{
              padding: "1rem 1.25rem",
              borderRadius: "0.75rem",
              backgroundColor: "#f9fafb",
              border: "1px solid rgba(15,23,42,0.06)",
              marginBottom: "1.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
                fontWeight: 600,
              }}
            >
              Predicted categories
            </h2>
            <CategoryPillStream categories={categories} />
          </div>
        )}
      </section>

      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          marginBottom: "2rem",
        }}
      >
        <RestaurantResults restaurants={restaurants} />
      </section>
    </main>
  );
}
