// File: app/QueryBox.tsx
// Commit: Restore QueryBoxProps definition so route.ts can pass onSubmit and disabled props.

"use client";

import React, { useState, FormEvent } from "react";

type QueryBoxProps = {
  onSubmit: (query: string) => void | Promise<void>;
  disabled?: boolean;
};

export function QueryBox({ onSubmit, disabled }: QueryBoxProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    await onSubmit(value);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='e.g. "Halal Pakistani restaurants nearby" or "A place with good breakfast and orange juice"'
        style={{
          width: "100%",
          minHeight: "80px",
          resize: "vertical",
          padding: "0.75rem 0.9rem",
          borderRadius: "0.5rem",
          border: "1px solid rgba(15,23,42,0.18)",
          fontSize: "0.95rem",
          lineHeight: 1.4,
          outline: "none",
          boxSizing: "border-box"
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
          disabled={disabled}
          style={{
            padding: "0.55rem 1.25rem",
            borderRadius: "999px",
            border: "none",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            background:
              "linear-gradient(135deg, rgba(239,68,68,1), rgba(249,115,22,1))",
            color: "#ffffff",
            boxShadow: "0 8px 18px rgba(249,115,22,0.35)"
          }}
        >
          Find restaurants
        </button>
      </div>
    </form>
  );
}
