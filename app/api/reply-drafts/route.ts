import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

function responseDraftBody(lead: { name: string; niche: string; city: string; state: string }) {
  return `Hi ${lead.name} team,

Thanks for getting back to me. The next step is simple: I can put together the no-obligation mobile lead-page mockup using your current website, services, reviews, branding, and public business information.

I’ll focus the mockup on one clear action — call, estimate request, or booking — so you can see the direction before paying anything. If you want the approved version launched, the setup is $450, with optional $99/month upkeep afterward.

If there’s one service or offer you want the mockup centered on, send it over. Otherwise I’ll use the main service shown on your site.

Gregory Crowell
GCCreative / AutoHQ AI`;
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

    if (lead.status === "LOST") {
      return NextResponse.json({ ok: false, error: "Lead is suppressed/lost" }, { status: 409 });
    }

    const subject = `Re: Quick lead-page idea for ${lead.name}`;

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
        title: "Lead-page response draft created",
        detail: `Created mockup-next-step response for ${lead.name}`
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
