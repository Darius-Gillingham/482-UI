// File: app/QueryBox.tsx
// Commit: Replace QueryBox with chat-style PromptBox that forwards query + lat/lon to /api/search.

"use client";

import React, { useState, FormEvent } from "react";

type QueryBoxProps = {
  lat: number | null;
  lon: number | null;
  state: string;
  city: string;
  postal: string;
  onResponse: (value: string) => void; // parent receives formatted result text
  disabled?: boolean;
};

export function QueryBox({
  lat,
  lon,
  state,
  city,
  postal,
  onResponse,
  disabled
}: QueryBoxProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!value.trim() || disabled) return;

    setLoading(true);

    try {
      const payload = {
        query: value,
        lat,
        lon,
        state,
        city,
        postal
      };

      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      onResponse(text);
    } catch (err) {
      onResponse("Error contacting server.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Describe what you want (e.g. “Halal Pakistani nearby” or “breakfast + orange juice”).'
        style={{
          width: "100%",
          minHeight: "90px",
          padding: "0.85rem 1rem",
          borderRadius: "10px",
          border: "1px solid rgba(0,0,0,0.15)",
          fontSize: "1rem",
          resize: "vertical",
          outline: "none",
          background: "#fff"
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "0.75rem"
        }}
      >
        <button
          type="submit"
          disabled={loading || disabled}
          style={{
            padding: "0.6rem 1.4rem",
            borderRadius: "50px",
            border: "none",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            background:
              "linear-gradient(135deg, rgba(239,68,68,1), rgba(249,115,22,1))",
            color: "#ffffff",
            opacity: loading ? 0.65 : 1
          }}
        >
          {loading ? "Searching…" : "Find restaurants"}
        </button>
      </div>
    </form>
  );
}
