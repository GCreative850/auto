import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { ok: false, error: "GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI are required first" },
      { status: 400 }
    );
  }

  const baseUrl = new URL(request.url).origin;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/gmail.readonly");
  authUrl.searchParams.set("state", baseUrl + "/gmail-sync");

  return NextResponse.redirect(authUrl.toString());
}
