import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

function getBaseUrl(request: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (envUrl) return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  return new URL(request.url).origin;
}

async function postJson(baseUrl: string, path: string, body?: Record<string, unknown>) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data.ok !== false, status: res.status, data };
}

async function runDailyAutomation(request: Request) {
  const baseUrl = getBaseUrl(request);
  const results = [];

  results.push(await postJson(baseUrl, "/api/leads/find", { niche: "Med Spa", city: "Pensacola", state: "FL" }));
  results.push(await postJson(baseUrl, "/api/leads/enrich-emails", { limit: 10 }));
  results.push(await postJson(baseUrl, "/api/outreach/drafts", { bulk: true }));
  results.push(await postJson(baseUrl, "/api/gmail-sync/scan"));

  const successCount = results.filter((item) => item.ok).length;

  await prisma.aiActivityLog.create({
    data: {
      title: "Daily automation run",
      detail: `Safe automation completed ${successCount}/4 steps. No emails were sent.`
    }
  });

  return NextResponse.json({
    ok: true,
    route: "automation-daily",
    baseUrl,
    successCount,
    totalSteps: 4,
    sendsEmail: false,
    results
  });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") || "";

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return runDailyAutomation(request);
}

export async function POST(request: Request) {
  return runDailyAutomation(request);
}
