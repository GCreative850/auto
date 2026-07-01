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

  const connected = checks.every((item) => item.configured);

  return NextResponse.json({
    ok: true,
    connected,
    checks,
    nextStep: connected
      ? "Gmail sync credentials are configured. Reply scanning can be enabled next."
      : "Add the missing Gmail OAuth environment variables in Vercel, then redeploy."
  });
}
