import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

function responseDraftBody(lead: { name: string; niche: string; city: string; state: string }) {
  return `Hi ${lead.name} team,\n\nThanks for getting back to me. I can put together a free short promo reel concept for your ${lead.niche.toLowerCase()} business in ${lead.city}, ${lead.state}.\n\nThe easiest next step is for me to use your current website, photos, and services to draft a quick content direction. If you have a specific offer, service, or event you want highlighted, send it over and I’ll base the sample around that.\n\nBest,\nGregory\nGregory Crowell Creative`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const leadId = body.leadId;

    if (!leadId) {
      return NextResponse.json({ ok: false, error: "leadId is required" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json({ ok: false, error: "Lead has no email" }, { status: 400 });
    }

    const subject = `Re: Free promo reel idea for ${lead.name}`;

    const existing = await prisma.outreachDraft.findFirst({
      where: {
        leadId: lead.id,
        subject
      }
    });

    if (existing) {
      return NextResponse.json({ ok: true, created: false, draft: existing });
    }

    const draft = await prisma.outreachDraft.create({
      data: {
        leadId: lead.id,
        subject,
        body: responseDraftBody(lead),
        status: "DRAFT"
      },
      include: { lead: true }
    });

    await prisma.aiActivityLog.create({
      data: {
        title: "Response draft created",
        detail: `Created response draft for ${lead.name}`
      }
    });

    return NextResponse.json({ ok: true, created: true, draft });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
