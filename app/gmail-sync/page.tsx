"use client";

import { useEffect, useState } from "react";

type Check = {
  name: string;
  configured: boolean;
};

type DetectedReply = {
  leadName: string;
  email: string;
  from: string;
  subject: string;
  snippet: string;
};

export default function GmailSyncPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [connected, setConnected] = useState(false);
  const [oauthReady, setOauthReady] = useState(false);
  const [nextStep, setNextStep] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [detected, setDetected] = useState<DetectedReply[]>([]);
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

  async function scanReplies() {
    try {
      setScanLoading(true);
      setError("");
      setScanMessage("Scanning Gmail...");
      const res = await fetch("/api/gmail-sync/scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Gmail scan failed");
      setDetected(data.detected || []);
      setScanMessage(`Scanned ${data.scanned} sent drafts. Detected ${data.detectedCount} possible replies.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gmail scan failed");
    } finally {
      setScanLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Gmail Sync</div>
        <h1>Gmail Reply Sync</h1>
        <p>Scan Gmail for replies from businesses you already marked sent.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/inbox">Reply Tracker</a>
          {oauthReady && !connected ? <a className="primary" href="/api/gmail-sync/connect">Connect Gmail</a> : null}
          {connected ? <button className="primary button-reset" disabled={scanLoading} onClick={scanReplies}>{scanLoading ? "Scanning..." : "Scan Gmail Replies"}</button> : null}
          <button className="secondary button-reset" onClick={loadStatus}>Refresh Status</button>
        </div>
        {error ? <p className="error">{error}</p> : scanMessage ? <p className="success">{scanMessage}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Status</span><strong>{loading ? "Checking" : connected ? "Connected" : oauthReady ? "Ready to Connect" : "Missing Keys"}</strong></div>
        <div className="card"><span>Mode</span><strong>Live Scan</strong></div>
        <div className="card"><span>Reply Board</span><strong>Ready</strong></div>
        <div className="card"><span>Auto Scan</span><strong>{connected ? "Unlocked" : "Locked"}</strong></div>
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
        <h2>Detected Replies</h2>
        {!detected.length ? <div className="item"><strong>No replies detected yet.</strong><p>Click Scan Gmail Replies after outreach has been sent.</p></div> : null}
        {detected.map((reply) => (
          <div className="item" key={reply.email + reply.subject}>
            <strong>{reply.leadName}</strong>
            <p>{reply.from || reply.email}</p>
            <p>{reply.subject}</p>
            <p>{reply.snippet}</p>
            <span className="badge">Moved to Interested</span>
          </div>
        ))}
      </section>
    </main>
  );
}
