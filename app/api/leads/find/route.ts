import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  types?: string[];
};

function scorePlace(place: GooglePlace) {
  const ratingScore = Math.round((place.rating || 0) * 12);
  const reviewScore = Math.min(30, Math.round((place.userRatingCount || 0) / 10));
  return Math.max(50, Math.min(99, ratingScore + reviewScore));
}

function parseLocation(formattedAddress: string | undefined, fallbackCity: string, fallbackState: string) {
  if (!formattedAddress) return { city: fallbackCity, state: fallbackState };

  const parts = formattedAddress.split(",").map((part) => part.trim());
  const city = parts.length >= 2 ? parts[parts.length - 3] || fallbackCity : fallbackCity;
  const statePart = parts.length >= 2 ? parts[parts.length - 2] || fallbackState : fallbackState;
  const state = statePart.split(" ")[0] || fallbackState;

  return { city, state };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          providerReady: false,
          error: "GOOGLE_PLACES_API_KEY is missing. Add it in Vercel Environment Variables to enable real lead finding."
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const niche = String(body.niche || "").trim();
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();

    if (!niche || !city || !state) {
      return NextResponse.json(
        { ok: false, error: "niche, city, and state are required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.rating,places.userRatingCount,places.types"
      },
      body: JSON.stringify({
        textQuery: `${niche} businesses in ${city}, ${state}`,
        maxResultCount: 10
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Google Places search failed",
          detail: data?.error?.message || "Unknown provider error"
        },
        { status: 502 }
      );
    }

    const places: GooglePlace[] = data.places || [];
    const imported = [];
    const skipped = [];

    for (const place of places) {
      const name = place.displayName?.text?.trim();
      if (!name) continue;

      const existing = await prisma.lead.findFirst({
        where: {
          name,
          city: { equals: city, mode: "insensitive" },
          state: { equals: state, mode: "insensitive" }
        }
      });

      if (existing) {
        skipped.push(existing);
        continue;
      }

      const location = parseLocation(place.formattedAddress, city, state);
      const lead = await prisma.lead.create({
        data: {
          name,
          niche,
          city: location.city,
          state: location.state,
          website: place.websiteUri || null,
          email: null,
          score: scorePlace(place),
          status: "NEW"
        }
      });

      imported.push(lead);
    }

    await prisma.aiActivityLog.create({
      data: {
        title: "Real lead finder ran",
        detail: `Imported ${imported.length} ${niche} leads near ${city}, ${state}`
      }
    });

    return NextResponse.json({
      ok: true,
      route: "leads-find",
      query: { niche, city, state },
      importedCount: imported.length,
      skippedCount: skipped.length,
      imported,
      skipped
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
