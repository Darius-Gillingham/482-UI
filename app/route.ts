// File: src/app/api/search/route.ts
// Commit: Add streaming search API that proxies to Python recommender and emits NDJSON chunks.

import { NextRequest } from "next/server";

type BackendCategory = {
  label: string;
  confidence: number;
};

type BackendRestaurant = {
  id: string;
  name: string;
  city: string;
  score: number;
};

type BackendResponse = {
  categories: BackendCategory[];
  restaurants: BackendRestaurant[];
};

export async function POST(req: NextRequest): Promise<Response> {
  let payload: { query: string; lat: number | null; lon: number | null };

  try {
    payload = (await req.json()) as {
      query: string;
      lat: number | null;
      lon: number | null;
    };
  } catch {
    return new Response("Invalid JSON body.", { status: 400 });
  }

  const { query, lat, lon } = payload;
  if (!query || typeof query !== "string") {
    return new Response("Missing or invalid 'query'.", { status: 400 });
  }

  const backendUrl = process.env.RECOMMENDER_API_URL;
  if (!backendUrl) {
    return new Response("Server not configured (RECOMMENDER_API_URL).", {
      status: 500,
    });
  }

  let backendData: BackendResponse;

  try {
    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        lat,
        lon,
      }),
    });

    if (!backendRes.ok) {
      return new Response("Upstream recommender error.", {
        status: 502,
      });
    }

    backendData = (await backendRes.json()) as BackendResponse;
  } catch {
    return new Response("Failed to reach recommender service.", {
      status: 502,
    });
  }

  const categories = backendData.categories || [];
  const restaurants = backendData.restaurants || [];
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      try {
        // 1) Send total category count
        const countChunk = JSON.stringify({
          type: "count",
          total: categories.length,
        });
        controller.enqueue(encoder.encode(countChunk + "\n"));

        // 2) Send each category as it would be "discovered"
        for (const cat of categories) {
          const categoryChunk = JSON.stringify({
            type: "category",
            label: cat.label,
            confidence: cat.confidence,
          });
          controller.enqueue(encoder.encode(categoryChunk + "\n"));
        }

        // 3) Send final restaurant results
        const resultsChunk = JSON.stringify({
          type: "results",
          restaurants,
        });
        controller.enqueue(encoder.encode(resultsChunk + "\n"));

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
