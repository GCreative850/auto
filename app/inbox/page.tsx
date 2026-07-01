"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  status: string;
};

type SentDraft = {
  id: string;
  subject: string;
  lead: Lead;
};

export default function InboxPage() {
  const [items, setItems] = useState<SentDraft[]>([]);
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
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not load inbox");
      setItems(data.sentDrafts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load inbox");
    } finally {
      setLoading(false);
    }
  }

  async function move(leadId: string, nextStatus: string) {
    try {
      setBusy(leadId + nextStatus);
      setError("");
      const res = await fetch("/api/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, nextStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not update inbox");
      setMessage(data.lead.name + " updated.");
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update inbox");
    } finally {
      setBusy("");
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  const waiting = useMemo(() => items.filter((item) => item.lead.status === "CONTACTED"), [items]);
  const warm = useMemo(() => items.filter((item) => item.lead.status === "INTERESTED"), [items]);
  const won = useMemo(() => items.filter((item) => item.lead.status === "CLIENT"), [items]);
  const archived = useMemo(() => items.filter((item) => item.lead.status === "LOST"), [items]);

  function card(item: SentDraft) {
    return (
      <div className="item" key={item.id}>
        <strong>{item.lead.name}</strong>
        <p>{item.subject}</p>
        <p>{item.lead.email || "No email"}</p>
        <span className="badge">{item.lead.status}</span>
        <div className="item-actions">
          <button className="secondary button-reset small" disabled={busy === item.lead.id + "CONTACTED"} onClick={() => move(item.lead.id, "CONTACTED")}>Waiting</button>
          <button className="secondary button-reset small" disabled={busy === item.lead.id + "INTERESTED"} onClick={() => move(item.lead.id, "INTERESTED")}>Interested</button>
          <button className="primary button-reset small" disabled={busy === item.lead.id + "CLIENT"} onClick={() => move(item.lead.id, "CLIENT")}>Client</button>
          <button className="secondary button-reset small" disabled={busy === item.lead.id + "LOST"} onClick={() => move(item.lead.id, "LOST")}>Archive</button>
        </div>
      </div>
    );
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Inbox</div>
        <h1>Reply Tracker</h1>
        <p>Track sent outreach from waiting to interested, client, or archived.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/pipeline">Pipeline</a>
          <a className="secondary" href="/followups">Follow-ups</a>
          <a className="secondary" href="/deals">Deals</a>
          <button className="secondary button-reset" onClick={loadItems}>Refresh</button>
        </div>
        {error ? <p className="error">{error}</p> : message ? <p className="success">{message}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Waiting</span><strong>{waiting.length}</strong></div>
        <div className="card"><span>Interested</span><strong>{warm.length}</strong></div>
        <div className="card"><span>Clients</span><strong>{won.length}</strong></div>
        <div className="card"><span>Archived</span><strong>{archived.length}</strong></div>
      </section>

      <section className="board">
        <div className="card"><h2>Waiting</h2>{loading ? <div className="item">Loading...</div> : null}{waiting.map(card)}</div>
        <div className="card"><h2>Interested</h2>{warm.map(card)}</div>
      </section>
      <section className="board">
        <div className="card"><h2>Clients</h2>{won.map(card)}</div>
        <div className="card"><h2>Archived</h2>{archived.map(card)}</div>
      </section>
    </main>
  );
}
