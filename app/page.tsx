// File: app/page.tsx
// Commit: Refactor main page to use ChatMessages' built-in input bar (QueryBox removed).

"use client";

import { useState } from "react";
import LocationSelect from "./LocationSelect";
import LatLongFetcher from "./LatLongFetcher";
import { ChatMessages, type ChatMessage } from "./ChatMessages";

export type CategoryPrediction = {
  label: string;
  confidence: number;
};

export default function Page() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPostal, setSelectedPostal] = useState("");

  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addUserMessage(text: string) {
    const now = Date.now();
    const msg: ChatMessage = {
      id: `u-${now}`,
      role: "user",
      text,
      timestamp: now,
    };
    setMessages((prev) => [...prev, msg]);
  }

  function addAssistantMessage(
    text: string,
    opts?: {
      categories?: CategoryPrediction[];
      restaurants?: { name: string; city: string }[];
    }
  ) {
    const now = Date.now();
    const msg: ChatMessage = {
      id: `a-${now}`,
      role: "assistant",
      text,
      categories: opts?.categories,
      restaurants: opts?.restaurants,
      timestamp: now,
    };
    setMessages((prev) => [...prev, msg]);
  }

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

    addUserMessage(trimmed);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          state: selectedState,
          city: selectedCity,
          postal: selectedPostal,
          lat,
          lon,
        }),
      });

      if (!res.ok) {
        throw new Error("Search failed.");
      }

      const data = await res.json();

      const categoriesRaw = Array.isArray(data.predicted_categories)
        ? data.predicted_categories
        : [];

      const categories: CategoryPrediction[] = categoriesRaw.map(
        (item: any) => ({
          label:
            (typeof item.category === "string" && item.category) ||
            (typeof item.label === "string" && item.label) ||
            "Unknown",
          confidence:
            typeof item.probability === "number"
              ? item.probability
              : typeof item.confidence === "number"
              ? item.confidence
              : 0,
        })
      );

      const restaurantRaw = Array.isArray(
        data.business?.top_10_details
      )
        ? data.business.top_10_details
        : [];

      const restaurants = restaurantRaw.map((r: any) => ({
        name: String(r.name ?? "Unknown"),
        city: String(r.city ?? ""),
      }));

      let assistantText: string;

      if (restaurants.length > 0) {
        assistantText =
          "Here are some restaurants that match what you're craving.";
      } else if (categories.length > 0) {
        assistantText =
          "I found some matching categories for your craving.";
      } else {
        assistantText =
          "I couldn't find confident matches for that description. Try rephrasing or narrowing down your request.";
      }

      addAssistantMessage(assistantText, { categories, restaurants });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unexpected error.";
      setError(msg);
      addAssistantMessage(
        "Something went wrong while searching. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 1rem",
        maxWidth: "900px",
        margin: "0 auto",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
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
      </div>

      {/* ChatGPT-style conversation (with input bar inside the component) */}
      <ChatMessages
        messages={messages}
        loading={loading}
        onSubmit={handleSearch}
      />

      {/* Any error message placed below the chat */}
      {error && (
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.9rem",
            color: "#b91c1c",
          }}
        >
          {error}
        </p>
      )}
    </main>
  );
}
