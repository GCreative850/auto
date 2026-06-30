"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  name: string;
  email: string | null;
  niche: string;
  city: string;
  state: string;
};

type Draft = {
  id: string;
  subject: string;
  body: string;
  status: string;
  lead?: Lead;
};

function gmailUrl(draft: Draft) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    tf: "1",
    to: draft.lead?.email || "",
    su: draft.subject,
    body: draft.body
  });

  return `https://mail.google.com/mail/u/0/?${params.toString()}`;
}

export default function PipelinePage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadDrafts() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/outreach/drafts", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not load pipeline");
      setDrafts(data.drafts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pipeline");
    } finally {
      setLoading(false);
    }
  }

  async function markSent(draftId: string) {
    try {
      setBusyId(draftId);
      setError("");
      const res = await fetch("/api/outreach/drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId, status: "SENT" })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not mark sent");
      setMessage("Marked sent. This lead is now waiting for reply.");
      await loadDrafts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark sent");
    } finally {
      setBusyId("");
    }
  }

  async function copyDraft(draft: Draft) {
    await navigator.clipboard.writeText(`To: ${draft.lead?.email || ""}\nSubject: ${draft.subject}\n\n${draft.body}`);
    setMessage("Draft copied. Paste it into Gmail, then mark sent after you send it.");
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  const approved = useMemo(() => drafts.filter((draft) => draft.status === "APPROVED"), [drafts]);
  const sent = useMemo(() => drafts.filter((draft) => draft.status === "SENT"), [drafts]);
  const working = useMemo(() => drafts.filter((draft) => draft.status === "DRAFT"), [drafts]);

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Pipeline</div>
        <h1>Outreach Tracker</h1>
        <p>Open or copy approved drafts, then mark them sent so AutoHQ knows who is waiting for a reply.</p>
        <div className="actions">
          <a className="secondary" href="/">Back to AutoHQ</a>
          <a className="secondary" href="/gmail-drafts">Gmail Drafts</a>
          <button className="secondary button-reset" onClick={loadDrafts}>Refresh</button>
        </div>
        {error ? <p className="error">{error}</p> : message ? <p className="success">{message}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Needs Approval</span><strong>{working.length}</strong></div>
        <div className="card"><span>Ready to Send</span><strong>{approved.length}</strong></div>
        <div className="card"><span>Waiting Reply</span><strong>{sent.length}</strong></div>
        <div className="card"><span>Total Drafts</span><strong>{drafts.length}</strong></div>
      </section>

      <section className="board">
        <div className="card">
          <h2>Ready to Send</h2>
          {loading ? <div className="item">Loading...</div> : null}
          {!loading && !approved.length ? <div className="item"><strong>No approved drafts ready.</strong><p>Approve drafts on the main page first.</p></div> : null}
          {approved.map((draft) => (
            <div className="item" key={draft.id}>
              <strong>{draft.subject}</strong>
              <p>{draft.lead?.name} • {draft.lead?.email}</p>
              <span className="badge">{draft.status}</span>
              <div className="item-actions">
                <a className="secondary small" href={gmailUrl(draft)} target="_blank" rel="noreferrer">Open Gmail</a>
                <button className="secondary button-reset small" onClick={() => copyDraft(draft)}>Copy Draft</button>
                <button className="primary button-reset small" disabled={busyId === draft.id} onClick={() => markSent(draft.id)}>
                  {busyId === draft.id ? "Saving..." : "Mark Sent"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>Waiting Reply</h2>
          {!sent.length ? <div className="item"><strong>No sent outreach yet.</strong><p>After sending in Gmail, click Mark Sent.</p></div> : null}
          {sent.map((draft) => (
            <div className="item" key={draft.id}>
              <strong>{draft.subject}</strong>
              <p>{draft.lead?.name} • {draft.lead?.email}</p>
              <span className="badge">Waiting Reply</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
