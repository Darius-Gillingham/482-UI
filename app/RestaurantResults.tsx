// File: app/RestaurantResults.tsx
// Commit: Update results component to use new predict_business output structure (top_10_details + confidence).

"use client";

import React from "react";

type BusinessDetail = {
  business_id: string;
  name: string;
  city: string;
};

type BusinessResult = {
  top_prediction: {
    business_id: string;
    confidence: number;
  };
  top_10_details: BusinessDetail[];
};

type RestaurantResultsProps = {
  result: BusinessResult | null;
};

export function RestaurantResults({ result }: RestaurantResultsProps) {
  if (!result || !result.top_10_details || result.top_10_details.length === 0) {
    return (
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "0.75rem",
          border: "1px dashed rgba(148,163,184,0.65)",
          backgroundColor: "#f9fafb"
        }}
      >
        <p style={{ fontSize: "0.9rem", opacity: 0.75 }}>
          Your best matching restaurants will appear here once the search
          completes.
        </p>
      </div>
    );
  }

  const { top_prediction, top_10_details } = result;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem"
      }}
    >
      {top_10_details.map((biz, index) => {
        const isTop = biz.business_id === top_prediction.business_id;

        return (
          <article
            key={biz.business_id}
            style={{
              padding: "0.9rem 1.1rem",
              borderRadius: "0.75rem",
              border: isTop
                ? "1px solid rgba(249,115,22,0.7)"
                : "1px solid rgba(148,163,184,0.4)",
              backgroundColor: isTop ? "#fffbeb" : "#ffffff",
              boxShadow: isTop
                ? "0 12px 26px rgba(249,115,22,0.18)"
                : "0 6px 18px rgba(15,23,42,0.04)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.25rem"
              }}
            >
              <h3
                style={{
                  fontSize: isTop ? "1.25rem" : "1.05rem",
                  fontFamily:
                    '"DM Serif Display", "Times New Roman", ui-serif, Georgia, serif'
                }}
              >
                {biz.name}
              </h3>

              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#b45309",
                  fontVariantNumeric: "tabular-nums"
                }}
              >
                {isTop
                  ? `Match ${(top_prediction.confidence * 100).toFixed(0)}%`
                  : `Rank #${index + 1}`}
              </div>
            </div>

            <div
              style={{
                fontSize: "0.9rem",
                opacity: 0.8,
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.25rem"
              }}
            >
              <span>{biz.city}</span>

              <span
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em"
                }}
              >
                {isTop ? "Top Recommendation" : "Alternative Match"}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
