import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const COMMON_BAD_MATCHES = ["example.com", "sentry.io", "wixpress.com", "schema.org"];

function cleanEmail(email: string) {
  return email.toLowerCase().replace(/[),.;]+$/g, "").trim();
}

function normalizeWebsite(website: string) {
  if (website.startsWith("http://") || website.startsWith("https://")) return website;
  return `https://${website}`;
}

function buildCandidateUrls(website: string) {
  const base = normalizeWebsite(website).replace(/\/$/, "");
  return [base, `${base}/contact`, `${base}/contact-us`, `${base}/about`, `${base}/about-us`];
}

function extractEmails(html: string) {
  const matches = html.match(EMAIL_REGEX) || [];
  const emails = matches.map(cleanEmail).filter((email) => {
    return !COMMON_BAD_MATCHES.some((badMatch) => email.includes(badMatch));
  });

  return Array.from(new Set(emails));
}

async function fetchPageText(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "AutoHQ Lead Enrichment Bot"
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) return "";
    return response.text();
  } catch {
    return "";
  }
}

async function findEmailForWebsite(website: string | null) {
  if (!website) return null;

  const urls = buildCandidateUrls(website);

  for (const url of urls) {
    const html = await fetchPageText(url);
    if (!html) continue;

    const emails = extractEmails(html);
    if (emails.length) return emails[0];
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({} as { limit?: number }));
    const limit = Number.isFinite(Number(body.limit)) ? Math.max(1, Math.min(25, Number(body.limit))) : 10;

    const leads = await prisma.lead.findMany({
      where: {
        email: null,
        website: { not: null }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    const updated = [];
    const checked = [];

    for (const lead of leads) {
      checked.push(lead.id);
      const email = await findEmailForWebsite(lead.website);

      if (!email) continue;

      const updatedLead = await prisma.lead.update({
        where: { id: lead.id },
        data: { email }
      });

      updated.push(updatedLead);
    }

    await prisma.aiActivityLog.create({
      data: {
        title: "Lead emails enriched",
        detail: `Checked ${checked.length} leads and found ${updated.length} emails`
      }
    });

    return NextResponse.json({
      ok: true,
      route: "leads-enrich-emails",
      checkedCount: checked.length,
      updatedCount: updated.length,
      updated
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
