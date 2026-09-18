import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

type GmailMessageList = {
  messages?: { id: string; threadId: string }[];
};

type GmailMessage = {
  id: string;
  threadId: string;
  snippet?: string;
  payload?: {
    headers?: { name: string; value: string }[];
  };
};

function header(message: GmailMessage, name: string) {
  return message.payload?.headers?.find((item) => item.name.toLowerCase() === name.toLowerCase())?.value || "";
}

function classifyReply(subject: string, snippet: string) {
  const text = `${subject} ${snippet}`.toLowerCase();

  const automated = [
    "out of office",
    "automatic reply",
    "auto reply",
    "autoreply",
    "away from the office",
    "on leave",
    "vacation reply"
  ];
  if (automated.some((term) => text.includes(term))) return "AUTOMATED";

  const negative = [
    "unsubscribe",
    "remove me",
    "do not contact",
    "don't contact",
    "not interested",
    "no thanks",
    "no thank you",
    "stop emailing",
    "stop contacting"
  ];
  if (negative.some((term) => text.includes(term))) return "NEGATIVE";

  const positive = [
    "interested",
    "send it",
    "send the mockup",
    "show me",
    "tell me more",
    "more info",
    "how much",
    "what does it cost",
    "let's do it",
    "lets do it",
    "sounds good",
    "yes",
    "sure"
  ];
  if (positive.some((term) => text.includes(term))) return "POSITIVE";

  return "REPLY";
}

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

export async function POST() {
  try {
    const accessToken = await getAccessToken();
    const sentDrafts = await prisma.outreachDraft.findMany({
      where: { status: "SENT" },
      include: { lead: true },
      orderBy: { updatedAt: "desc" },
      take: 50
    });

    const detected = [];

    for (const draft of sentDrafts) {
      const email = draft.lead.email;
      if (!email) continue;

      const bounceQuery = encodeURIComponent(`from:mailer-daemon newer_than:45d "${email}"`);
      const bounceList = await gmailGet<GmailMessageList>(`messages?q=${bounceQuery}&maxResults=1`, accessToken);

      if (bounceList.messages?.[0]) {
        await prisma.lead.update({ where: { id: draft.leadId }, data: { status: "LOST" } });
        detected.push({
          leadId: draft.leadId,
          leadName: draft.lead.name,
          email,
          from: "Mail Delivery Subsystem",
          subject: "Delivery failure detected",
          date: "",
          snippet: "Recipient address bounced; lead suppressed.",
          classification: "BOUNCE"
        });
        continue;
      }

      const query = encodeURIComponent(`from:${email} newer_than:45d`);
      const list = await gmailGet<GmailMessageList>(`messages?q=${query}&maxResults=5`, accessToken);
      const first = list.messages?.[0];
      if (!first) continue;

      const message = await gmailGet<GmailMessage>(`messages/${first.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, accessToken);
      const subject = header(message, "Subject");
      const from = header(message, "From");
      const date = header(message, "Date");
      const snippet = message.snippet || "";
      const classification = classifyReply(subject, snippet);

      if (classification === "POSITIVE" && draft.lead.status === "CONTACTED") {
        await prisma.lead.update({ where: { id: draft.leadId }, data: { status: "INTERESTED" } });
      } else if (classification === "NEGATIVE") {
        await prisma.lead.update({ where: { id: draft.leadId }, data: { status: "LOST" } });
      }

      detected.push({
        leadId: draft.leadId,
        leadName: draft.lead.name,
        email,
        from,
        subject,
        date,
        snippet,
        classification
      });
    }

    const actionable = detected.filter((item) => item.classification === "POSITIVE" || item.classification === "REPLY");

    await prisma.aiActivityLog.create({
      data: {
        title: "Gmail reply scan complete",
        detail: `Detected ${detected.length} replies; ${actionable.length} potentially actionable`
      }
    });

    return NextResponse.json({
      ok: true,
      scanned: sentDrafts.length,
      detectedCount: detected.length,
      actionableCount: actionable.length,
      detected
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
