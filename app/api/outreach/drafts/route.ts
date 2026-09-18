import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

function buildDraft(lead: {
  name: string;
  niche: string;
  city: string;
  state: string;
  website: string | null;
}) {
  const subject = `Quick lead-page idea for ${lead.name}`;
  const niche = lead.niche || "local service";
  const body = `Hi ${lead.name} team,

I’m Gregory with GCCreative / AutoHQ AI. I build focused mobile lead pages for quote- and appointment-driven businesses.

I came across ${lead.name} in ${lead.city}, ${lead.state}. I can put together a no-obligation custom mockup showing a cleaner path from mobile visitor to call, estimate, or booking request, using your current branding and public business information.

If you like the direction, the full launch is $450 and includes a mobile-first lead page, click-to-call, estimate/booking form, services, reviews, service-area copy, basic SEO structure, and deployment. Ongoing updates are optional at $99/month.

Would you like me to send the mockup?

Gregory Crowell
GCCreative / AutoHQ AI

If this isn’t relevant, just reply no and I won’t follow up.`;

  return { subject, body };
}

async function createDraftForLead(lead: {
  id: string;
  name: string;
  niche: string;
  city: string;
  state: string;
  website: string | null;
  status: string;
}) {
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

  if (lead.status === "NEW") {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "CONTACTED" }
    });
  }

  return draft;
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
    const body = await request.json();

    if (body.bulk === true) {
      const leads = await prisma.lead.findMany({
        where: {
          email: { not: null },
          status: { in: ["NEW", "CONTACTED"] },
          drafts: { none: {} }
        },
        orderBy: [{ score: "desc" }, { createdAt: "desc" }],
        take: 25
      });

      const drafts = [];

      for (const lead of leads) {
        if (!lead.email || !lead.email.includes("@")) continue;
        const draft = await createDraftForLead(lead);
        drafts.push(draft);
      }

      await prisma.aiActivityLog.create({
        data: {
          title: "Bulk lead-page drafts created",
          detail: `Created ${drafts.length} $450 lead-page outreach drafts for email-ready leads`
        }
      });

      return NextResponse.json({
        ok: true,
        route: "outreach-drafts-bulk",
        createdCount: drafts.length,
        drafts
      });
    }

    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ ok: false, error: "leadId is required" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) {
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }

    if (lead.status === "LOST") {
      return NextResponse.json({ ok: false, error: "Lead is suppressed/lost" }, { status: 409 });
    }

    const existingDraft = await prisma.outreachDraft.findFirst({ where: { leadId: lead.id } });

    if (existingDraft) {
      return NextResponse.json({ ok: true, draft: existingDraft, skipped: true });
    }

    const draft = await createDraftForLead(lead);

    await prisma.aiActivityLog.create({
      data: {
        title: "Lead-page outreach draft created",
        detail: `Created $450 lead-page outreach draft for ${lead.name}`
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

export async function PATCH(request: Request) {
  try {
    const { draftId, status } = await request.json();

    if (!draftId) {
      return NextResponse.json({ ok: false, error: "draftId is required" }, { status: 400 });
    }

    if (!["APPROVED", "SENT", "FAILED"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Supported statuses: APPROVED, SENT, FAILED" }, { status: 400 });
    }

    const draft = await prisma.outreachDraft.update({
      where: { id: draftId },
      data: { status },
      include: { lead: true }
    });

    if (status === "SENT") {
      await prisma.lead.update({
        where: { id: draft.leadId },
        data: { status: "CONTACTED" }
      });
    }

    await prisma.aiActivityLog.create({
      data: {
        title: status === "SENT" ? "Outreach marked sent" : status === "FAILED" ? "Outreach failed" : "Outreach draft approved",
        detail: `${status} outreach for ${draft.lead.name}`
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
