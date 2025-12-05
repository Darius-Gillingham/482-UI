// File: 482-ui/app/api/search/route.ts
// Commit: Fix full prediction pipeline using separate category + business Railway URLs.

import { NextResponse } from "next/server";

const CATEGORY_URL = process.env.NEXT_PUBLIC_RAILWAY_CATEGORY_URL;
const BUSINESS_URL = process.env.NEXT_PUBLIC_RAILWAY_BUSINESS_URL;

export async function POST(req: Request) {
  // ---------------- ENV VALIDATION ----------------
  if (!CATEGORY_URL) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_RAILWAY_CATEGORY_URL" },
      { status: 500 }
    );
  }

  if (!BUSINESS_URL) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_RAILWAY_BUSINESS_URL" },
      { status: 500 }
    );
  }

  
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

  let categoryResponse: Response;
  try {
    categoryResponse = await fetch(`${CATEGORY_URL}/predict_category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query,
        threshold: 0.3,
      }),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach category service" },
      { status: 500 }
    );
  }

  if (!categoryResponse.ok) {
    return NextResponse.json(
      { error: "Category prediction failed" },
      { status: 500 }
    );
  }

  const categoryJSON = await categoryResponse.json();
  const predicted_categories = categoryJSON.predicted_categories;

  if (!predicted_categories || predicted_categories.length === 0) {
    return NextResponse.json({
      query,
      predicted_categories: [],
      business_results: [],
      warning: "No categories above threshold.",
    });
  }

 
  let businessResponse: Response;
  try {
    businessResponse = await fetch(`${BUSINESS_URL}/predict_business`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query,
        lat: lat,
        lon: lon,
        predicted_categories: predicted_categories,
      }),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach business service" },
      { status: 500 }
    );
  }

  if (!businessResponse.ok) {
    return NextResponse.json(
      { error: "Business prediction failed" },
      { status: 500 }
    );
  }

  const businessJSON = await businessResponse.json();


  return NextResponse.json({
    query,
    predicted_categories,
    business: businessJSON,
  });
}
