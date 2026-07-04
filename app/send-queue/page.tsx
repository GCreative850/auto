"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  status: string;
};

type Draft = {
  id: string;
  subject: string;
  body: string;
  status: string;
  lead?: Lead;
};

function gmailUrl(draft: Draft) {
  const to = draft.lead?.email || "";
  const body = encodeURIComponent(draft.body);
  const subject = encodeURIComponent(draft.subject);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${subject}&body=${body}`;
}

export default function SendQueuePage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadDrafts() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/outreach/drafts", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not load drafts");
      setDrafts(data.drafts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load drafts");
    } finally {
      setLoading(false);
    }
  }

  async function markSent(draftId: string) {
    try {
      setBusy(draftId);
      setError("");
      const res = await fetch("/api/outreach/drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId, status: "SENT" })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not mark sent");
      setMessage("Marked sent. Auto Checker can now watch for replies.");
      await loadDrafts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark sent");
    } finally {
      setBusy("");
    }
  }

  async function runChecker() {
    try {
      setBusy("checker");
      setError("");
      const res = await fetch("/api/gmail-sync/scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Checker failed");
      setMessage(`Checked ${data.scanned} sent drafts and found ${data.detectedCount} replies.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checker failed");
    } finally {
      setBusy("");
    }
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  const ready = useMemo(() => drafts.filter((draft) => draft.status === "APPROVED" && draft.lead?.email), [drafts]);
  const sent = useMemo(() => drafts.filter((draft) => draft.status === "SENT"), [drafts]);

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Send Queue</div>
        <h1>Send Queue + Auto Checker</h1>
        <p>Open approved emails fast, mark them sent, then check replies.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/automation">Automation</a>
          <a className="secondary" href="/pipeline">Pipeline</a>
          <button className="secondary button-reset" onClick={loadDrafts}>Refresh</button>
          <button className="primary button-reset" disabled={busy === "checker"} onClick={runChecker}>{busy === "checker" ? "Checking..." : "Run Auto Checker"}</button>
        </div>
        {error ? <p className="error">{error}</p> : message ? <p className="success">{message}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Ready to Send</span><strong>{loading ? "..." : ready.length}</strong></div>
        <div className="card"><span>Sent Watching</span><strong>{loading ? "..." : sent.length}</strong></div>
        <div className="card"><span>Send Mode</span><strong>Controlled</strong></div>
        <div className="card"><span>Checker</span><strong>Live</strong></div>
      </section>

      <section className="card">
        <h2>Approved Queue</h2>
        {loading ? <div className="item">Loading...</div> : null}
        {!loading && !ready.length ? <div className="item"><strong>No approved drafts ready.</strong><p>Approve drafts first, then come back here.</p></div> : null}
        {ready.map((draft) => (
          <div className="item" key={draft.id}>
            <strong>{draft.lead?.name || "Lead"}</strong>
            <p>{draft.lead?.email}</p>
            <p>{draft.subject}</p>
            <div className="item-actions">
              <a className="primary small" href={gmailUrl(draft)} target="_blank">Open Gmail</a>
              <button className="secondary button-reset small" disabled={busy === draft.id} onClick={() => markSent(draft.id)}>Mark Sent</button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
