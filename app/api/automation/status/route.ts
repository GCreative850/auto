import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET() {
  try {
    const [leads, emails, drafts, approved, sent, interested, clients, logs] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { email: { not: null } } }),
      prisma.outreachDraft.count(),
      prisma.outreachDraft.count({ where: { status: "APPROVED" } }),
      prisma.outreachDraft.count({ where: { status: "SENT" } }),
      prisma.lead.count({ where: { status: "INTERESTED" } }),
      prisma.lead.count({ where: { status: "CLIENT" } }),
      prisma.aiActivityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 })
    ]);

    return NextResponse.json({
      ok: true,
      counts: { leads, emails, drafts, approved, sent, interested, clients },
      logs
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
