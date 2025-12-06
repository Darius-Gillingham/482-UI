// File: 482-ui/app/api/search/route.ts
// Commit: Collapse to single Railway backend URL and restore full local-behavior pipeline (category → business) with correct category reshaping.

import { NextResponse } from "next/server";

// Single backend root URL
// Example: https://my-railway-app.up.railway.app
const BASE_URL = process.env.NEXT_PUBLIC_RAILWAY_URL;

export async function POST(req: Request) {
  // ---------------- ENV VALIDATION ----------------
  if (!BASE_URL) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_RAILWAY_URL" },
      { status: 500 }
    );
  }

  const CATEGORY_URL = `${BASE_URL}/predict_category`;
  const BUSINESS_URL = `${BASE_URL}/predict_business`;

  // ---------------- INPUT PARSING ----------------
  const body = await req.json();

  const query: string = body.query;
  const lat: number | null = body.lat ?? null;
  const lon: number | null = body.lon ?? null;

  if (!query) {
    return NextResponse.json(
      { error: "Missing query" },
      { status: 400 }
    );
  }

  if (lat === null || lon === null) {
    return NextResponse.json(
      { error: "Missing lat/lon for business prediction" },
      { status: 400 }
    );
  }

  // ------------------------------------------------------
  // 1. CATEGORY PREDICTION (same behavior as localhost DFA)
  // ------------------------------------------------------
  let categoryRes: Response;
  try {
    categoryRes = await fetch(CATEGORY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach prediction backend (CATEGORY)" },
      { status: 500 }
    );
  }

  if (!categoryRes.ok) {
    return NextResponse.json(
      { error: "Category prediction failed" },
      { status: 500 }
    );
  }

  const categoryJSON = await categoryRes.json();
  const predicted_categories = categoryJSON.predicted_categories;

  if (!predicted_categories || predicted_categories.length === 0) {
    return NextResponse.json(
      {
        query,
        predicted_categories: [],
        business_results: [],
        warning: "No categories above threshold."
      },
      { status: 200 }
    );
  }

  // ------------------------------------------------------
  // 2. BUSINESS PREDICTION (RESTORES LOCAL PIPELINE EXACTLY)
  // ------------------------------------------------------
  // CRITICAL: reshape category objects exactly how Flask expects
  const formattedCategories = predicted_categories.map((c: any) => ({
    category: c.category,
    probability: c.probability
  }));

  let businessRes: Response;
  try {
    businessRes = await fetch(BUSINESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        lat,
        lon,
        predicted_categories: formattedCategories
      })
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach prediction backend (BUSINESS)" },
      { status: 500 }
    );
  }

  if (!businessRes.ok) {
    return NextResponse.json(
      { error: "Business prediction failed" },
      { status: 500 }
    );
  }

  const businessJSON = await businessRes.json();

  // ------------------------------------------------------
  // FINAL RESPONSE
  // ------------------------------------------------------
  return NextResponse.json(
    {
      query,
      predicted_categories,
      business: businessJSON
    },
    { status: 200 }
  );
}
