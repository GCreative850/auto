import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

type ManualLead = {
  name?: string;
  niche?: string;
  city?: string;
  state?: string;
  email?: string;
  website?: string;
  score?: number;
};

function normalizeLead(input: ManualLead) {
  return {
    name: String(input.name || "").trim(),
    niche: String(input.niche || "Local Business").trim(),
    city: String(input.city || "Pensacola").trim(),
    state: String(input.state || "FL").trim(),
    email: input.email ? String(input.email).trim() : null,
    website: input.website ? String(input.website).trim() : null,
    score: Number.isFinite(Number(input.score)) ? Math.max(50, Math.min(99, Number(input.score))) : 75
  };
}

function parseLine(line: string, fallback: { niche: string; city: string; state: string }) {
  const parts = line.split("|").map((part) => part.trim());
  return normalizeLead({
    name: parts[0],
    niche: parts[1] || fallback.niche,
    city: parts[2] || fallback.city,
    state: parts[3] || fallback.state,
    email: parts[4] || undefined,
    website: parts[5] || undefined,
    score: parts[6] ? Number(parts[6]) : 75
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fallback = {
      niche: String(body.niche || "Local Business").trim(),
      city: String(body.city || "Pensacola").trim(),
      state: String(body.state || "FL").trim()
    };

    const parsedLeads = Array.isArray(body.leads)
      ? body.leads.map(normalizeLead)
      : String(body.text || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => parseLine(line, fallback));

    const validLeads = parsedLeads.filter((lead) => lead.name.length > 1);

    if (!validLeads.length) {
      return NextResponse.json(
        { ok: false, error: "Paste at least one lead. Format: Name | Niche | City | State | Email | Website | Score" },
        { status: 400 }
      );
    }

    const imported = [];
    const skipped = [];

    for (const leadInput of validLeads) {
      const existing = await prisma.lead.findFirst({
        where: {
          name: { equals: leadInput.name, mode: "insensitive" },
          city: { equals: leadInput.city, mode: "insensitive" },
          state: { equals: leadInput.state, mode: "insensitive" }
        }
      });

      if (existing) {
        skipped.push(existing);
        continue;
      }

      const lead = await prisma.lead.create({
        data: {
          name: leadInput.name,
          niche: leadInput.niche,
          city: leadInput.city,
          state: leadInput.state,
          email: leadInput.email,
          website: leadInput.website,
          score: leadInput.score,
          status: "NEW"
        }
      });

      imported.push(lead);
    }

    await prisma.aiActivityLog.create({
      data: {
        title: "Manual leads imported",
        detail: `Imported ${imported.length} manual leads and skipped ${skipped.length} duplicates`
      }
    });

    return NextResponse.json({
      ok: true,
      route: "leads-import",
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
