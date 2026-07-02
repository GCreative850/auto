"use client";

import { useEffect, useState } from "react";

type Check = {
  name: string;
  configured: boolean;
};

export default function GmailSyncPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [connected, setConnected] = useState(false);
  const [oauthReady, setOauthReady] = useState(false);
  const [nextStep, setNextStep] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStatus() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/gmail-sync/status", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not load Gmail sync status");
      setChecks(data.checks || []);
      setConnected(Boolean(data.connected));
      setOauthReady(Boolean(data.oauthReady));
      setNextStep(data.nextStep || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load Gmail sync status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Gmail Sync</div>
        <h1>Gmail Reply Sync Setup</h1>
        <p>Connect Gmail credentials so AutoHQ can scan for replies and move leads automatically later.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/inbox">Reply Tracker</a>
          {oauthReady && !connected ? <a className="primary" href="/api/gmail-sync/connect">Connect Gmail</a> : null}
          <button className="secondary button-reset" onClick={loadStatus}>Refresh Status</button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Status</span><strong>{loading ? "Checking" : connected ? "Connected" : oauthReady ? "Ready to Connect" : "Missing Keys"}</strong></div>
        <div className="card"><span>Mode</span><strong>Safe Setup</strong></div>
        <div className="card"><span>Reply Board</span><strong>Ready</strong></div>
        <div className="card"><span>Auto Scan</span><strong>{connected ? "Next" : "Locked"}</strong></div>
      </section>

      <section className="card">
        <h2>Required Vercel Environment Variables</h2>
        {loading ? <div className="item">Checking Gmail sync setup...</div> : null}
        {checks.map((check) => (
          <div className="item" key={check.name}>
            <strong>{check.name}</strong>
            <span className="badge">{check.configured ? "Configured" : "Missing"}</span>
          </div>
        ))}
        {nextStep ? <p className="success">{nextStep}</p> : null}
      </section>

      <section className="card">
        <h2>How to finish</h2>
        <div className="item"><strong>Step 1</strong><p>Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in Vercel.</p></div>
        <div className="item"><strong>Step 2</strong><p>Redeploy, then click Connect Gmail on this page.</p></div>
        <div className="item"><strong>Step 3</strong><p>Copy the refresh token into Vercel as GMAIL_REFRESH_TOKEN and redeploy again.</p></div>
      </section>
    </main>
  );
}
