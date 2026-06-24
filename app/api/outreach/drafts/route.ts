import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

function buildDraft(lead: {
  name: string;
  niche: string;
  city: string;
  state: string;
  website: string | null;
}) {
  const subject = `Free promo reel idea for ${lead.name}`;
  const body = `Hi ${lead.name} team,\n\nI’m reaching out from Gregory Crowell Creative. We help local businesses turn their existing photos, videos, services, and offers into short promo reels for Instagram, TikTok, Facebook, and YouTube Shorts.\n\nI wanted to offer ${lead.name} a free sample reel concept first. No upfront cost — I’ll create a short concept around your ${lead.niche.toLowerCase()} business in ${lead.city}, ${lead.state}. If you like the direction, we can talk about doing more consistently.\n\nThis is built to help you get more attention online without having to film, edit, or post everything yourself.\n\nWould you be open to me sending over a free sample concept?\n\nBest,\nGregory\nGregory Crowell Creative`;

  return { subject, body };
}

export async function GET() {
  try {
    const drafts = await prisma.outreachDraft.findMany({
      include: { lead: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ ok: true, route: "outreach-drafts", drafts });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json({ ok: false, error: "leadId is required" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) {
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }

    const draftContent = buildDraft(lead);

    const draft = await prisma.outreachDraft.create({
      data: {
        leadId: lead.id,
        subject: draftContent.subject,
        body: draftContent.body,
        status: "DRAFT"
      },
      include: { lead: true }
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: lead.status === "NEW" ? "CONTACTED" : lead.status }
    });

    await prisma.aiActivityLog.create({
      data: {
        title: "Outreach draft created",
        detail: `Created outreach draft for ${lead.name}`
      }
    });

    return NextResponse.json({ ok: true, draft });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
