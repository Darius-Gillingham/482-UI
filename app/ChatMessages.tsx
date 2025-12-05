// File: app/ChatMessages.tsx
// Commit: Add embedded bottom input bar inside chat container (ChatGPT-style).

"use client";

import React, { useEffect, useRef, useState } from "react";
import { CategoryPillStream } from "./CategoryPillStream";
import type { CategoryPrediction } from "./page";

type ChatMessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  text: string;
  categories?: CategoryPrediction[];
  restaurants?: { name: string; city: string }[];
  timestamp: number;
};

type ChatMessagesProps = {
  messages: ChatMessage[];
  loading: boolean;
  onSubmit: (query: string) => void;
};

export function ChatMessages({ messages, loading, onSubmit }: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");

  // Auto-scroll on every message
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, loading]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setInput("");
  }

  return (
    <section
      style={{
        width: "100%",
        maxWidth: "720px",
        height: "70vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: "0.9rem",
        border: "1px solid rgba(15,23,42,0.08)",
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
          fontSize: "0.95rem",
          fontWeight: 600,
        }}
      >
        Conversation
      </header>

      {/* MESSAGES */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          padding: "0.85rem 0.75rem 1rem 0.75rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.65rem",
          background:
            "radial-gradient(circle at top, rgba(251,146,60,0.04), transparent 60%)",
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "0.75rem 0.9rem",
                  borderRadius: isUser
                    ? "1rem 1rem 0.25rem 1rem"
                    : "1rem 1rem 1rem 0.25rem",
                  background: isUser
                    ? "linear-gradient(135deg, #ff7a00, #ff4d00)"
                    : "#f3f4f6",
                  color: isUser ? "#ffffff" : "#111827",
                  boxShadow: isUser
                    ? "0 14px 32px rgba(248,113,22,0.35)"
                    : "0 10px 26px rgba(15,23,42,0.12)",
                }}
              >
                <p style={{ margin: 0 }}>{msg.text}</p>

                {!isUser &&
                  msg.categories &&
                  msg.categories.length > 0 && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <CategoryPillStream categories={msg.categories} />
                    </div>
                  )}

                {!isUser &&
                  msg.restaurants &&
                  msg.restaurants.length > 0 && (
                    <div
                      style={{
                        marginTop: "0.45rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.35rem",
                      }}
                    >
                      {msg.restaurants.map((r, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "0.4rem 0.55rem",
                            borderRadius: "0.55rem",
                            backgroundColor: "#fff",
                            border: "1px solid rgba(209,213,219,0.9)",
                          }}
                        >
                          <b>{r.name}</b> — {r.city}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT BAR — now attached to bottom */}
      <form
        onSubmit={handleSend}
        style={{
          padding: "0.75rem",
          borderTop: "1px solid rgba(15,23,42,0.06)",
          display: "flex",
          gap: "0.5rem",
          backgroundColor: "#fff",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What are you craving?"
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(15,23,42,0.15)",
            fontSize: "1rem",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0 1.1rem",
            borderRadius: "0.75rem",
            background: "linear-gradient(135deg, #ff7a00, #ff4d00)",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </form>
    </section>
  );
}
