// File: 482-ui/app/api/search/route.ts
// Commit: Rewrite search endpoint to run full pipeline: category prediction + business prediction, then return combined output.

import { NextResponse } from "next/server";

const RAILWAY_URL = process.env.NEXT_PUBLIC_RAILWAY_URL;

export async function POST(req: Request) {
  if (!RAILWAY_URL) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_RAILWAY_URL" },
      { status: 500 }
    );
  }

  // ---------- 1. Extract fields from UI ----------
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

  // ---------- 2. CATEGORY PREDICTION ----------
  const categoryResponse = await fetch(`${RAILWAY_URL}/predict_category`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: query,
      threshold: 0.3
    })
  });

  if (!categoryResponse.ok) {
    return NextResponse.json(
      { error: "Category prediction failed" },
      { status: 500 }
    );
  }

  const categoryJSON = await categoryResponse.json();
  const predicted_categories = categoryJSON.predicted_categories;

  // If no categories → return early
  if (!predicted_categories || predicted_categories.length === 0) {
    return NextResponse.json({
      query,
      predicted_categories,
      business_results: [],
      warning: "No categories above threshold."
    });
  }

  // ---------- 3. BUSINESS PREDICTION ----------
  if (lat == null || lon == null) {
    return NextResponse.json(
      { error: "Missing lat/lon for business prediction" },
      { status: 400 }
    );
  }

  const businessResponse = await fetch(`${RAILWAY_URL}/predict_business`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: query,
      lat: lat,
      lon: lon,
      predicted_categories: predicted_categories
    })
  });

  if (!businessResponse.ok) {
    return NextResponse.json(
      { error: "Business prediction failed" },
      { status: 500 }
    );
  }

  const businessJSON = await businessResponse.json();

  // ---------- 4. Final Combined Result ----------
  return NextResponse.json({
    query,
    predicted_categories,
    business: businessJSON
  });
}
