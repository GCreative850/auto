"use client";

import { useEffect, useState } from "react";

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

export default function FollowUpsPage() {
  const [sent, setSent] = useState<Draft[]>([]);
  const [followUps, setFollowUps] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadFollowUps() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/outreach/followups", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not load follow-ups");
      setSent(data.sent || []);
      setFollowUps(data.followUps || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load follow-ups");
    } finally {
      setLoading(false);
    }
  }

  async function generateFollowUps() {
    try {
      setBusy(true);
      setError("");
      const res = await fetch("/api/outreach/followups", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not generate follow-ups");
      setMessage(`Created ${data.createdCount} follow-up drafts.`);
      await loadFollowUps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate follow-ups");
    } finally {
      setBusy(false);
    }
  }

  async function approveDraft(draftId: string) {
    try {
      setBusyId(draftId);
      setError("");
      const res = await fetch("/api/outreach/drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId, status: "APPROVED" })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not approve follow-up");
      setMessage("Follow-up approved.");
      await loadFollowUps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not approve follow-up");
    } finally {
      setBusyId("");
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
      setMessage("Follow-up marked sent.");
      await loadFollowUps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark sent");
    } finally {
      setBusyId("");
    }
  }

  async function copyDraft(draft: Draft) {
    await navigator.clipboard.writeText(`To: ${draft.lead?.email || ""}\nSubject: ${draft.subject}\n\n${draft.body}`);
    setMessage("Follow-up copied. Paste it into Gmail if needed.");
  }

  useEffect(() => {
    loadFollowUps();
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Follow-ups</div>
        <h1>Follow-Up Drafts</h1>
        <p>Create follow-up drafts for leads you already marked sent.</p>
        <div className="actions">
          <a className="secondary" href="/">Back to AutoHQ</a>
          <a className="secondary" href="/pipeline">Pipeline</a>
          <button className="primary button-reset" disabled={busy} onClick={generateFollowUps}>
            {busy ? "Creating..." : "Generate Follow-Up Drafts"}
          </button>
          <button className="secondary button-reset" onClick={loadFollowUps}>Refresh</button>
        </div>
        {error ? <p className="error">{error}</p> : message ? <p className="success">{message}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Sent Leads</span><strong>{sent.length}</strong></div>
        <div className="card"><span>Follow-ups</span><strong>{followUps.length}</strong></div>
        <div className="card"><span>Draft</span><strong>{followUps.filter((d) => d.status === "DRAFT").length}</strong></div>
        <div className="card"><span>Ready/Sent</span><strong>{followUps.filter((d) => d.status !== "DRAFT").length}</strong></div>
      </section>

      <section className="card">
        <h2>Follow-Up Queue</h2>
        {loading ? <div className="item">Loading...</div> : null}
        {!loading && !followUps.length ? (
          <div className="item">
            <strong>No follow-ups yet</strong>
            <p>Mark outreach as sent in Pipeline, then click Generate Follow-Up Drafts.</p>
          </div>
        ) : null}
        {followUps.map((draft) => (
          <div className="item" key={draft.id}>
            <strong>{draft.subject}</strong>
            <p>{draft.lead?.name} • {draft.lead?.email} • {draft.status}</p>
            <pre>{draft.body}</pre>
            <div className="item-actions">
              {draft.status === "DRAFT" ? (
                <button className="secondary button-reset small" disabled={busyId === draft.id} onClick={() => approveDraft(draft.id)}>
                  {busyId === draft.id ? "Saving..." : "Approve Follow-Up"}
                </button>
              ) : (
                <>
                  <a className="secondary small" href={gmailUrl(draft)} target="_blank" rel="noreferrer">Open Gmail</a>
                  <button className="secondary button-reset small" onClick={() => copyDraft(draft)}>Copy Draft</button>
                  <button className="primary button-reset small" disabled={busyId === draft.id} onClick={() => markSent(draft.id)}>
                    {busyId === draft.id ? "Saving..." : "Mark Sent"}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
