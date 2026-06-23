import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

const starterLeads = [
  {
    name: "Emerald Coast Med Spa",
    niche: "Med Spa",
    city: "Pensacola",
    state: "FL",
    email: "hello@example.com",
    website: "https://example.com",
    score: 88,
  },
  {
    name: "Precision Roofing Co",
    niche: "Roofing",
    city: "Navarre",
    state: "FL",
    email: "contact@example.com",
    website: "https://example.com",
    score: 81,
  },
  {
    name: "Gulf Breeze Auto Detail",
    niche: "Auto Detailing",
    city: "Gulf Breeze",
    state: "FL",
    email: "info@example.com",
    website: "https://example.com",
    score: 76,
  },
];

export async function POST() {
  try {
    const results = [];

    for (const lead of starterLeads) {
      const created = await prisma.lead.create({ data: lead });
      results.push(created);
    }

    await prisma.aiActivityLog.create({
      data: {
        title: "Database seeded",
        detail: `${results.length} starter leads were added.`,
      },
    });

    return NextResponse.json({ ok: true, created: results.length, leads: results });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Seed failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
