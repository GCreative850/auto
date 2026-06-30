import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

function buildFollowUp(lead: {
  name: string;
  niche: string;
  city: string;
  state: string;
}) {
  const subject = `Quick follow-up for ${lead.name}`;
  const body = `Hi ${lead.name} team,\n\nJust wanted to follow up on my last message. I’d still be happy to put together a free short promo reel concept for your ${lead.niche.toLowerCase()} business in ${lead.city}, ${lead.state}.\n\nNo pressure — I just think it could give you an easy piece of content to use for Instagram, TikTok, Facebook, or YouTube Shorts.\n\nWould you like me to send over a quick sample idea?\n\nBest,\nGregory\nGregory Crowell Creative`;

  return { subject, body };
}

export async function GET() {
  try {
    const sent = await prisma.outreachDraft.findMany({
      where: { status: "SENT" },
      include: { lead: true },
      orderBy: { updatedAt: "desc" }
    });

    const followUps = await prisma.outreachDraft.findMany({
      where: { subject: { startsWith: "Quick follow-up" } },
      include: { lead: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ ok: true, route: "outreach-followups", sent, followUps });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const sentDrafts = await prisma.outreachDraft.findMany({
      where: { status: "SENT" },
      include: { lead: true },
      orderBy: { updatedAt: "desc" },
      take: 25
    });

    const created = [];

    for (const sentDraft of sentDrafts) {
      const existingFollowUp = await prisma.outreachDraft.findFirst({
        where: {
          leadId: sentDraft.leadId,
          subject: { startsWith: "Quick follow-up" }
        }
      });

      if (existingFollowUp || !sentDraft.lead.email) continue;

      const followUp = buildFollowUp(sentDraft.lead);
      const draft = await prisma.outreachDraft.create({
        data: {
          leadId: sentDraft.leadId,
          subject: followUp.subject,
          body: followUp.body,
          status: "DRAFT"
        },
        include: { lead: true }
      });

      created.push(draft);
    }

    await prisma.aiActivityLog.create({
      data: {
        title: "Follow-up drafts created",
        detail: `Created ${created.length} follow-up drafts from sent outreach`
      }
    });

    return NextResponse.json({ ok: true, createdCount: created.length, created });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
