import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

const sampleLeads = [
  {
    name: "Emerald Coast Med Spa",
    niche: "Med Spa",
    city: "Pensacola",
    state: "FL",
    email: "hello@example-medspa.com",
    website: "https://example-medspa.com",
    score: 86,
    status: "NEW" as const,
  },
  {
    name: "Precision Roofing Co",
    niche: "Roofing",
    city: "Navarre",
    state: "FL",
    email: "info@example-roofing.com",
    website: "https://example-roofing.com",
    score: 78,
    status: "NEW" as const,
  },
  {
    name: "Gulf Breeze Auto Detail",
    niche: "Mobile Detailing",
    city: "Gulf Breeze",
    state: "FL",
    email: "contact@example-detailing.com",
    website: "https://example-detailing.com",
    score: 82,
    status: "NEW" as const,
  },
];

export async function GET() {
  try {
    const created = [];

    for (const lead of sampleLeads) {
      const existing = await prisma.lead.findFirst({
        where: { name: lead.name, city: lead.city, state: lead.state },
      });

      if (!existing) {
        created.push(await prisma.lead.create({ data: lead }));
      }
    }

    await prisma.aiActivityLog.create({
      data: {
        title: "Sample leads seeded",
        detail: `${created.length} sample leads were added to AutoHQ.`,
      },
    });

    return NextResponse.json({
      ok: true,
      route: "leads/seed",
      created: created.length,
      message: "Sample leads seeded. Now open /api/leads.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        route: "leads/seed",
        error: "Failed to seed leads",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
