import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ ok: true, leads });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load leads",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        niche: body.niche || "Local Business",
        city: body.city || "Unknown",
        state: body.state || "Unknown",
        email: body.email || null,
        website: body.website || null,
        score: Number(body.score || 50),
        status: body.status || "NEW",
      },
    });

    await prisma.aiActivityLog.create({
      data: {
        title: "Lead created",
        detail: `${lead.name} was added to AutoHQ.`,
      },
    });

    return NextResponse.json({ ok: true, lead }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to create lead",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
