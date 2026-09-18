import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

function buildFollowUp(lead: {
  name: string;
  niche: string;
  city: string;
  state: string;
}) {
  const subject = `Quick follow-up for ${lead.name}`;
  const body = `Hi ${lead.name} team,

Just following up on my last note. I can still put together a no-obligation mobile lead-page mockup for ${lead.name}, focused on making it easier for visitors to call, request an estimate, or book.

If the direction is useful, the full launch is $450 with optional $99/month upkeep. If not, no problem.

Want me to send the mockup?

Gregory Crowell
GCCreative / AutoHQ AI

If this isn’t relevant, just reply no and I won’t follow up again.`;

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
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const sentDrafts = await prisma.outreachDraft.findMany({
      where: {
        status: "SENT",
        updatedAt: { lte: twoDaysAgo },
        lead: { status: "CONTACTED" }
      },
      include: { lead: true },
      orderBy: { updatedAt: "asc" },
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
        detail: `Created ${created.length} one-time follow-up drafts for leads waiting at least 2 days`
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
