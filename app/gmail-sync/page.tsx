"use client";

import { useEffect, useState } from "react";

type Check = {
  name: string;
  configured: boolean;
};

export default function GmailSyncPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [connected, setConnected] = useState(false);
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
          <button className="secondary button-reset" onClick={loadStatus}>Refresh Status</button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Status</span><strong>{loading ? "Checking" : connected ? "Connected" : "Missing Keys"}</strong></div>
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
        <h2>What this unlocks next</h2>
        <div className="item"><strong>Reply detection</strong><p>AutoHQ can search sent outreach subjects and matching business emails.</p></div>
        <div className="item"><strong>Suggested response</strong><p>When someone replies, AutoHQ can create a response draft instead of sending automatically.</p></div>
        <div className="item"><strong>Lead movement</strong><p>Positive replies can be moved to Interested and then Deals.</p></div>
      </section>
    </main>
  );
}
