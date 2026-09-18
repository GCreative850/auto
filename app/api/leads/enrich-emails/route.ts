import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const COMMON_BAD_MATCHES = [
  "example.com",
  "sentry.io",
  "wixpress.com",
  "schema.org",
  "wordpress.com",
  "cloudflare.com"
];
const BAD_LOCAL_PARTS = ["noreply", "no-reply", "donotreply", "do-not-reply", "mailer-daemon"];

function cleanEmail(email: string) {
  return email.toLowerCase().replace(/[),.;]+$/g, "").trim();
}

function normalizeWebsite(website: string) {
  if (website.startsWith("http://") || website.startsWith("https://")) return website;
  return `https://${website}`;
}

function websiteDomain(website: string) {
  try {
    return new URL(normalizeWebsite(website)).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function buildCandidateUrls(website: string) {
  const base = normalizeWebsite(website).replace(/\/$/, "");
  return [base, `${base}/contact`, `${base}/contact-us`, `${base}/about`, `${base}/about-us`];
}

function extractEmails(html: string) {
  const matches = html.match(EMAIL_REGEX) || [];
  const emails = matches.map(cleanEmail).filter((email) => {
    const [local] = email.split("@");
    if (!local) return false;
    if (BAD_LOCAL_PARTS.some((term) => local.includes(term))) return false;
    return !COMMON_BAD_MATCHES.some((badMatch) => email.includes(badMatch));
  });

  return Array.from(new Set(emails));
}

function scoreEmail(email: string, domain: string) {
  const [local, emailDomain = ""] = email.split("@");
  let score = 0;

  if (domain && (emailDomain === domain || emailDomain.endsWith(`.${domain}`))) score += 100;
  if (["info", "contact", "hello", "office", "sales", "service", "support", "appointments", "booking"].includes(local)) score += 25;
  if (["gmail.com", "outlook.com", "yahoo.com", "icloud.com", "hotmail.com"].includes(emailDomain)) score += 5;

  return score;
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

  const domain = websiteDomain(website);
  const found = new Set<string>();

  for (const url of buildCandidateUrls(website)) {
    const html = await fetchPageText(url);
    if (!html) continue;
    for (const email of extractEmails(html)) found.add(email);
  }

  if (!found.size) return null;

  return [...found]
    .sort((a, b) => scoreEmail(b, domain) - scoreEmail(a, domain))[0] || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({} as { limit?: number }));
    const limit = Number.isFinite(Number(body.limit)) ? Math.max(1, Math.min(25, Number(body.limit))) : 10;

    const leads = await prisma.lead.findMany({
      where: {
        email: null,
        website: { not: null },
        status: { not: "LOST" }
      },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
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
        detail: `Checked ${checked.length} leads and found ${updated.length} official-site email candidates`
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
