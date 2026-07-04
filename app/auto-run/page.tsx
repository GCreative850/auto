"use client";

import { useMemo, useState } from "react";

type RunResult = {
  ok?: boolean;
  error?: string;
  results?: {
    leads?: unknown;
    emails?: unknown;
    drafts?: { createdCount?: number };
    scan?: { scanned?: number; detectedCount?: number };
  };
};

export default function AutoRunPage() {
  const [niche, setNiche] = useState("Auto Detailing");
  const [city, setCity] = useState("Pensacola");
  const [state, setState] = useState("FL");
  const [limit, setLimit] = useState("10");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [message, setMessage] = useState("");

  const sendCommand = useMemo(() => {
    const count = result?.results?.drafts?.createdCount || limit;
    return `Send the next ${count} Gmail drafts now. Keep trying one-by-one until they are sent. If a draft blocks, retry it after sending the others, then tell me exactly how many sent and who replied.`;
  }, [limit, result]);

  async function runAuto() {
    try {
      setBusy(true);
      setMessage("Running lead finder, email enrichment, draft creation, and reply checker...");
      setResult(null);
      const res = await fetch("/api/automation/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, city, state, limit: Number(limit) || 10 })
      });
      const data = await res.json();
      setResult(data);
      if (!res.ok || !data.ok) throw new Error(data.error || "Auto Run failed");
      setMessage("Auto Run finished. The send command is ready below.");
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText(sendCommand);
          setMessage("Auto Run finished and copied the send command. Paste it into ChatGPT.");
        } catch {
          setMessage("Auto Run finished. Tap Copy Send Command and paste it into ChatGPT.");
        }
      }, 250);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Auto Run failed");
    } finally {
      setBusy(false);
    }
  }

  async function copyCommand() {
    await navigator.clipboard.writeText(sendCommand);
    setMessage("Copied. Paste it into ChatGPT to send the drafts.");
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Auto Run</div>
        <h1>One-Click Outreach Run</h1>
        <p>Runs lead finding, email enrichment, draft creation, reply checking, then prepares the ChatGPT send command.</p>
        <div className="actions">
          <a className="secondary" href="/command-center">Command Center</a>
          <a className="secondary" href="/send-queue">Send Queue</a>
          <button className="primary button-reset" disabled={busy} onClick={runAuto}>{busy ? "Running..." : "Auto Run"}</button>
        </div>
        {message ? <p className={result?.ok ? "success" : "error"}>{message}</p> : null}
      </section>

      <section className="card finder-card">
        <h2>Run Settings</h2>
        <div className="finder-form">
          <label>Business Type<input value={niche} onChange={(event) => setNiche(event.target.value)} /></label>
          <label>City<input value={city} onChange={(event) => setCity(event.target.value)} /></label>
          <label>State<input value={state} onChange={(event) => setState(event.target.value)} /></label>
          <label>Lead Limit<input value={limit} onChange={(event) => setLimit(event.target.value)} /></label>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span>Step 1</span><strong>Find Leads</strong><p>Runs Places lead search.</p></div>
        <div className="card"><span>Step 2</span><strong>Find Emails</strong><p>Enriches websites into email-ready leads.</p></div>
        <div className="card"><span>Step 3</span><strong>Create Drafts</strong><p>Makes Gmail-ready outreach drafts.</p></div>
        <div className="card"><span>Step 4</span><strong>Copy Command</strong><p>Paste into ChatGPT and I send the drafts.</p></div>
      </section>

      {result?.ok ? (
        <section className="card">
          <h2>ChatGPT Send Command</h2>
          <div className="item">
            <p>{sendCommand}</p>
            <button className="primary button-reset small" onClick={copyCommand}>Copy Send Command</button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
