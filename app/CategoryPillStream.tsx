// File: src/app/CategoryPillStream.tsx
// Commit: Add pill-style category list that updates as streamed categories arrive.

"use client";

import React from "react";
import type { CategoryPrediction } from "./page";

type CategoryPillStreamProps = {
  categories: CategoryPrediction[];
};

export function CategoryPillStream({
  categories,
}: CategoryPillStreamProps) {
  if (categories.length === 0) {
    return (
      <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
        Categories will appear here as we process your query.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.4rem",
      }}
    >
      {categories.map((cat) => (
        <span
          key={cat.label}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.25rem 0.7rem",
            borderRadius: "999px",
            fontSize: "0.85rem",
            backgroundColor: "#fef2f2",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <span style={{ fontWeight: 500, marginRight: "0.3rem" }}>
            {cat.label}
          </span>
          <span
            style={{
              fontVariantNumeric: "tabular-nums",
              opacity: 0.8,
            }}
          >
            {(cat.confidence * 100).toFixed(0)}%
          </span>
        </span>
      ))}
    </div>
  );
}
