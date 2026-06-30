import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: { drafts: true },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ ok: true, leads });
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
    const leadId = body.leadId;
    const nextStatus = body.nextStatus;

    if (!leadId) {
      return NextResponse.json({ ok: false, error: "leadId is required" }, { status: 400 });
    }

    if (!["INTERESTED", "CLIENT", "LOST"].includes(nextStatus)) {
      return NextResponse.json({ ok: false, error: "nextStatus is invalid" }, { status: 400 });
    }

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status: nextStatus },
      include: { drafts: true }
    });

    await prisma.aiActivityLog.create({
      data: {
        title: "Client tracker updated",
        detail: lead.name + " moved to " + nextStatus
      }
    });

    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
