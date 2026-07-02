import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!code) {
    return NextResponse.json({ ok: false, error: "Missing Gmail authorization code" }, { status: 400 });
  }

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { ok: false, error: "Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REDIRECT_URI" },
      { status: 400 }
    );
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    return NextResponse.json({ ok: false, error: tokenData.error_description || tokenData.error || "Token exchange failed" }, { status: 400 });
  }

  const refreshToken = tokenData.refresh_token || "";

  const html = `<!doctype html>
<html>
<head>
  <title>AutoHQ Gmail Connected</title>
  <style>
    body { background: #09090f; color: #fff; font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; }
    .card { max-width: 900px; border: 1px solid #2b2b35; border-radius: 24px; padding: 28px; background: #11111a; }
    code, textarea { width: 100%; background: #050509; color: #00ff99; border: 1px solid #2b2b35; border-radius: 14px; padding: 16px; font-size: 14px; }
    textarea { min-height: 120px; }
    a { color: #00ff99; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Gmail Connected</h1>
    <p>Copy this refresh token into Vercel as <strong>GMAIL_REFRESH_TOKEN</strong>.</p>
    ${refreshToken ? `<textarea readonly>${refreshToken}</textarea>` : `<p>No refresh token was returned. Go back and click Connect Gmail again.</p>`}
    <p>Then redeploy and return to <a href="/gmail-sync">Gmail Sync</a>.</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
