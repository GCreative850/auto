import { NextResponse } from "next/server";

export async function GET() {
  const required = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
    "GMAIL_REFRESH_TOKEN"
  ];

  const checks = required.map((name) => ({
    name,
    configured: Boolean(process.env[name])
  }));

  const oauthReady = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI
  );
  const connected = checks.every((item) => item.configured);

  return NextResponse.json({
    ok: true,
    connected,
    oauthReady,
    checks,
    nextStep: connected
      ? "Gmail sync credentials are configured. Reply scanning can be enabled next."
      : oauthReady
        ? "Click Connect Gmail to generate GMAIL_REFRESH_TOKEN."
        : "Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in Vercel, then redeploy."
  });
}
