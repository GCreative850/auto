"use client";

import { useEffect, useState } from "react";

type Lead = {
  name: string;
  email: string | null;
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

function mailtoUrl(draft: Draft) {
  const to = draft.lead?.email || "";
  const params = new URLSearchParams({
    subject: draft.subject,
    body: draft.body
  });

  return `mailto:${to}?${params.toString()}`;
}

export default function GmailDraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function loadDrafts() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/outreach/drafts", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not load drafts");
      setDrafts((data.drafts || []).filter((draft: Draft) => draft.status === "APPROVED" && draft.lead?.email));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load drafts");
    } finally {
      setLoading(false);
    }
  }

  async function copyDraft(draft: Draft) {
    const text = `To: ${draft.lead?.email || ""}\nSubject: ${draft.subject}\n\n${draft.body}`;
    await navigator.clipboard.writeText(text);
    setCopied(draft.id);
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Gmail Drafts</div>
        <h1>Approved Drafts to Gmail</h1>
        <p>Open approved outreach drafts in Gmail, open your mail app, or copy the full draft if Google sends you to Workspace.</p>
        <div className="actions">
          <a className="secondary" href="/">Back to AutoHQ</a>
          <button className="secondary button-reset" onClick={loadDrafts}>Refresh Drafts</button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="card">
        <h2>Ready for Gmail</h2>
        {loading ? <div className="item">Loading drafts...</div> : null}
        {!loading && !drafts.length ? (
          <div className="item">
            <strong>No approved email drafts yet</strong>
            <p>Create and approve drafts on the main AutoHQ page first.</p>
          </div>
        ) : null}
        {drafts.map((draft) => (
          <div className="item" key={draft.id}>
            <strong>{draft.subject}</strong>
            <p>{draft.lead?.name} • {draft.lead?.email}</p>
            <pre>{draft.body}</pre>
            <div className="item-actions">
              <a className="secondary small" href={gmailUrl(draft)} target="_blank" rel="noreferrer">
                Open Gmail
              </a>
              <a className="secondary small" href={mailtoUrl(draft)}>
                Open Mail App
              </a>
              <button className="secondary button-reset small" onClick={() => copyDraft(draft)}>
                {copied === draft.id ? "Copied" : "Copy Draft"}
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
