import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          keyLoaded: false,
          error: "GOOGLE_PLACES_API_KEY is not loaded in this Vercel deployment. Add it to Production env and redeploy."
        },
        { status: 400 }
      );
    }

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress"
      },
      body: JSON.stringify({
        textQuery: "mobile detailing businesses in Pensacola FL",
        maxResultCount: 1
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          keyLoaded: true,
          googleStatus: response.status,
          error: data?.error?.message || "Google rejected the Places request.",
          googleError: data?.error || null
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      keyLoaded: true,
      googleStatus: response.status,
      placesReturned: data?.places?.length || 0,
      sample: data?.places?.[0] || null
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
