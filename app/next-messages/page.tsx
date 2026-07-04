"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  status: string;
};

type Item = {
  id: string;
  subject: string;
  lead: Lead;
};

export default function NextMessagesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadItems() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/replies", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not load items");
      setItems(data.sentDrafts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load items");
    } finally {
      setLoading(false);
    }
  }

  async function makeNext(leadId: string) {
    try {
      setBusy(leadId);
      setError("");
      const res = await fetch("/api/reply-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not create next message");
      setMessage(data.created ? "Next message created." : "Next message already exists.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create next message");
    } finally {
      setBusy("");
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  const ready = useMemo(() => items.filter((item) => item.lead.status === "INTERESTED"), [items]);

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Next Messages</div>
        <h1>Next Messages</h1>
        <p>Create review-only next messages for interested leads.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/inbox">Reply Tracker</a>
          <a className="secondary" href="/gmail-drafts">Gmail Drafts</a>
          <button className="secondary button-reset" onClick={loadItems}>Refresh</button>
        </div>
        {error ? <p className="error">{error}</p> : message ? <p className="success">{message}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Ready</span><strong>{ready.length}</strong></div>
        <div className="card"><span>Mode</span><strong>Review</strong></div>
        <div className="card"><span>Send</span><strong>Manual</strong></div>
        <div className="card"><span>Status</span><strong>Live</strong></div>
      </section>

      <section className="card">
        <h2>Interested Leads</h2>
        {loading ? <div className="item">Loading...</div> : null}
        {!loading && !ready.length ? <div className="item"><strong>No interested leads yet.</strong><p>Run Gmail Sync or move a lead to Interested in Reply Tracker.</p></div> : null}
        {ready.map((item) => (
          <div className="item" key={item.id}>
            <strong>{item.lead.name}</strong>
            <p>{item.lead.email || "No email"}</p>
            <p>{item.subject}</p>
            <button className="primary button-reset small" disabled={busy === item.lead.id} onClick={() => makeNext(item.lead.id)}>
              {busy === item.lead.id ? "Creating..." : "Create Next Message"}
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
