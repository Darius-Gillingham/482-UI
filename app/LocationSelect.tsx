// File: app/LocationSelect.tsx
// Commit: Add collapsible panel and "Change Location" button to toggle visibility of the selector while preserving all existing logic.

"use client";

import { useState, useEffect } from "react";
import locationData from "./location_data.json";

type LocationJSON = {
  [state: string]: {
    [city: string]: {
      count: number;
      postal_codes: string[];
    };
  };
};

type LocationSelectProps = {
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPostalChange: (value: string) => void;
};

const typedData = locationData as LocationJSON;

export default function LocationSelect({
  onStateChange,
  onCityChange,
  onPostalChange
}: LocationSelectProps) {
  const [stateList, setStateList] = useState<string[]>([]);
  const [cityList, setCityList] = useState<string[]>([]);
  const [postalList, setPostalList] = useState<string[]>([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPostal, setSelectedPostal] = useState("");

  // NEW: toggle open/closed
  const [open, setOpen] = useState(false);

  // Load states on mount
  useEffect(() => {
    setStateList(Object.keys(typedData));
  }, []);

  function handleStateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const st = e.target.value;

    setSelectedState(st);
    setSelectedCity("");
    setSelectedPostal("");

    onStateChange(st);

    if (st && typedData[st]) {
      setCityList(Object.keys(typedData[st]));
    } else {
      setCityList([]);
    }

    setPostalList([]);
  }

  function handleCityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const ct = e.target.value;

    setSelectedCity(ct);
    setSelectedPostal("");

    onCityChange(ct);

    if (selectedState && ct && typedData[selectedState][ct]) {
      setPostalList(typedData[selectedState][ct].postal_codes);
    } else {
      setPostalList([]);
    }
  }

  function handlePostalChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const pc = e.target.value;
    setSelectedPostal(pc);
    onPostalChange(pc);
  }

  return (
    <div style={{ width: "100%", marginBottom: "1.25rem" }}>
      {/* ─────────────────────────────────────────────── */}
      {/* TOGGLE BUTTON */}
      {/* ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "0.65rem 1.2rem",
          borderRadius: "0.5rem",
          background: "linear-gradient(135deg, #ef4444, #f97316)",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: 600,
          marginBottom: "0.5rem",
          width: "fit-content",
          boxShadow: "0 6px 16px rgba(249,115,22,0.35)"
        }}
      >
        {open ? "Close Location Selector" : "Change Location"}
      </button>

      {/* ─────────────────────────────────────────────── */}
      {/* COLLAPSIBLE PANEL */}
      {/* ─────────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            width: "100%",
            padding: "1rem",
            borderRadius: "0.75rem",
            backgroundColor: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            marginTop: "0.5rem"
          }}
        >
          <h2
            style={{
              fontSize: "1.15rem",
              marginBottom: "0.75rem",
              fontWeight: 600
            }}
          >
            Select Location
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            }}
          >
            {/* STATE */}
            <select
              value={selectedState}
              onChange={handleStateChange}
              style={{
                padding: "0.65rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.95rem"
              }}
            >
              <option value="">Select State</option>
              {stateList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* CITY */}
            <select
              value={selectedCity}
              onChange={handleCityChange}
              disabled={!selectedState}
              style={{
                padding: "0.65rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.95rem",
                opacity: selectedState ? 1 : 0.5
              }}
            >
              <option value="">Select City</option>
              {cityList.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {/* POSTAL */}
            <select
              value={selectedPostal}
              onChange={handlePostalChange}
              disabled={!selectedCity}
              style={{
                padding: "0.65rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.95rem",
                opacity: selectedCity ? 1 : 0.5
              }}
            >
              <option value="">Select Postal Code</option>
              {postalList.map((pc) => (
                <option key={pc} value={pc}>
                  {pc}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
