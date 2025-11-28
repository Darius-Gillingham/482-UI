// File: src/app/LoadingBar.tsx
// Commit: Add loading bar that fills as categories are streamed from the API.

"use client";

import React from "react";

type LoadingBarProps = {
  current: number;
  total: number;
};

export function LoadingBar({ current, total }: LoadingBarProps){
  const safeTotal = total <= 0 ? 1 : total;
  const clampedCurrent = current < 0 ? 0 : current > safeTotal ? safeTotal : current;
  const percent = (clampedCurrent / safeTotal) * 100;

  return (
    <div>
      <div
        style={{
          fontSize: "0.85rem",
          marginBottom: "0.25rem",
          opacity: 0.8,
        }}
      >
        Matching your craving to categories ({clampedCurrent}/{safeTotal})
      </div>
      <div
        style={{
          width: "100%",
          height: "6px",
          borderRadius: "999px",
          backgroundColor: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: "999px",
            background:
              "linear-gradient(90deg, rgba(34,197,94,1), rgba(132,204,22,1))",
            transition: "width 160ms linear",
          }}
        />
      </div>
    </div>
  );
}
