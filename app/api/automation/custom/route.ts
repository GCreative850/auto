import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

function base(request: Request) {
  const host = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (host) return host.startsWith("http") ? host : `https://${host}`;
  return new URL(request.url).origin;
}

async function call(url: string, path: string, body?: Record<string, unknown>) {
  const res = await fetch(`${url}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data.ok !== false, status: res.status, data };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const niche = String(body.niche || "Med Spa").trim() || "Med Spa";
    const city = String(body.city || "Pensacola").trim() || "Pensacola";
    const state = String(body.state || "FL").trim() || "FL";
    const limit = Math.min(Math.max(Number(body.limit || 10), 1), 25);
    const url = base(request);

    const results = [];
    results.push(await call(url, "/api/leads/find", { niche, city, state }));
    results.push(await call(url, "/api/leads/enrich-emails", { limit }));
    results.push(await call(url, "/api/outreach/drafts", { bulk: true }));
    results.push(await call(url, "/api/gmail-sync/scan"));

    const successCount = results.filter((item) => item.ok).length;

    await prisma.aiActivityLog.create({
      data: {
        title: "Custom automation run",
        detail: `Completed ${successCount}/4 steps for ${niche} in ${city}, ${state}.`
      }
    });

    return NextResponse.json({ ok: true, niche, city, state, limit, successCount, totalSteps: 4, results });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
