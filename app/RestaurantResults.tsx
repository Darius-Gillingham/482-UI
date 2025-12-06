// File: app/RestaurantResults.tsx
// Commit: Remove dependency on page.tsx and define RestaurantPrediction locally to fix Vercel build.

"use client";

import React from "react";

// This type is now defined locally.
// It matches what your route returns under business.top_10_details.
export type RestaurantPrediction = {
  name: string;
  city: string;
};

type RestaurantResultsProps = {
  restaurants: RestaurantPrediction[];
};

export function RestaurantResults({ restaurants }: RestaurantResultsProps) {
  if (restaurants.length === 0) {
    return (
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "0.75rem",
          border: "1px dashed rgba(148,163,184,0.65)",
          backgroundColor: "#f9fafb",
        }}
      >
        <p style={{ fontSize: "0.9rem", opacity: 0.75 }}>
          Your best matching restaurants will appear here once the search
          completes.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
      }}
    >
      {restaurants.map((restaurant, index) => {
        const isTop = index === 0;

        return (
          <article
            key={`${restaurant.name}-${index}`}
            style={{
              padding: "0.9rem 1.1rem",
              borderRadius: "0.75rem",
              border: isTop
                ? "1px solid rgba(249,115,22,0.7)"
                : "1px solid rgba(148,163,184,0.4)",
              backgroundColor: isTop ? "#fffbeb" : "#ffffff",
              boxShadow: isTop
                ? "0 12px 26px rgba(249,115,22,0.18)"
                : "0 6px 18px rgba(15,23,42,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.25rem",
              }}
            >
              <h3
                style={{
                  fontSize: isTop ? "1.25rem" : "1.05rem",
                  fontFamily:
                    '"DM Serif Display", "Times New Roman", ui-serif, Georgia, serif',
                }}
              >
                {restaurant.name}
              </h3>

              <div
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.8,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {isTop ? "Top recommendation" : `Rank #${index + 1}`}
              </div>
            </div>

            <div
              style={{
                fontSize: "0.9rem",
                opacity: 0.8,
              }}
            >
              {restaurant.city}
            </div>
          </article>
        );
      })}
    </div>
  );
}
