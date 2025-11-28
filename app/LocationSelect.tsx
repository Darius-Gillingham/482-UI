// File: app/LocationSelect.tsx
// Commit: Add JSON typing for safe indexing and remove all TS index signature errors.

"use client";

import { useState, useEffect } from "react";
import citiesData from "./city_counts_food.json";

type CityCounts = {
  [state: string]: {
    [city: string]: number;
  };
};

type LocationSelectProps = {
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
};

const citiesDataTyped = citiesData as CityCounts;

export default function LocationSelect({ onStateChange, onCityChange }: LocationSelectProps) {
  const [stateList, setStateList] = useState<string[]>([]);
  const [cityList, setCityList] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  useEffect(() => {
    setStateList(Object.keys(citiesDataTyped));
  }, []);

  function handleStateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedCity("");
    onStateChange(newState);

    if (newState && citiesDataTyped[newState]) {
      setCityList(Object.keys(citiesDataTyped[newState]));
    } else {
      setCityList([]);
    }
  }

  function handleCityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newCity = e.target.value;
    setSelectedCity(newCity);
    onCityChange(newCity);
  }

  return (
    <div
      style={{
        width: "100%",
        marginBottom: "1.25rem",
        padding: "1rem",
        borderRadius: "0.75rem",
        backgroundColor: "#ffffff",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
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

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
      </div>
    </div>
  );
}
