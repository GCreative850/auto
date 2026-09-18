import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

type GmailMessageList = {
  messages?: { id: string; threadId: string }[];
};

type GmailMessage = {
  id: string;
  threadId: string;
  snippet?: string;
};

async function getAccessToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Gmail sync credentials");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Could not refresh Gmail access token");
  }

  return data.access_token as string;
}

async function gmailGet<T>(path: string, accessToken: string) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Gmail API request failed");
  }
  return data as T;
}

function extractFailedRecipient(snippet: string) {
  const patterns = [
    /wasn't delivered to\s+<?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})>?/i,
    /delivering your message to\s+<?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})>?/i,
    /message to\s+<?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})>?\s+(?:has|was|could)/i,
    /recipient(?: address)?:?\s*<?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})>?/i
  ];

  for (const pattern of patterns) {
    const match = snippet.match(pattern);
    if (match?.[1]) return match[1].toLowerCase();
  }

  return null;
}

export async function POST() {
  try {
    const accessToken = await getAccessToken();
    const query = encodeURIComponent("from:mailer-daemon@googlemail.com newer_than:60d");
    const list = await gmailGet<GmailMessageList>(`messages?q=${query}&maxResults=100`, accessToken);

    const bounced = new Set<string>();
    const suppressed: { email: string; leadId: string; leadName: string }[] = [];

    for (const item of list.messages || []) {
      const message = await gmailGet<GmailMessage>(`messages/${item.id}?format=metadata`, accessToken);
      const email = extractFailedRecipient(message.snippet || "");
      if (!email || email === "gccreative850@gmail.com" || bounced.has(email)) continue;
      bounced.add(email);

      const lead = await prisma.lead.findFirst({
        where: { email: { equals: email, mode: "insensitive" } }
      });

      if (!lead) continue;

      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: "LOST" }
      });

      await prisma.outreachDraft.updateMany({
        where: {
          leadId: lead.id,
          status: { in: ["DRAFT", "APPROVED"] }
        },
        data: { status: "FAILED" }
      });

      suppressed.push({ email, leadId: lead.id, leadName: lead.name });
    }

    await prisma.aiActivityLog.create({
      data: {
        title: "Bounce suppression scan complete",
        detail: `Found ${bounced.size} unique failed recipients and suppressed ${suppressed.length} matching AutoHQ leads`
      }
    });

    return NextResponse.json({
      ok: true,
      checked: list.messages?.length || 0,
      bouncedCount: bounced.size,
      bounced: Array.from(bounced),
      suppressedCount: suppressed.length,
      suppressed
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
