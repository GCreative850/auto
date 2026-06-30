"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: string;
  name: string;
  niche: string;
  city: string;
  state: string;
  email: string | null;
  status: string;
};

export default function DealsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadDeals() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/clients", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not load deals");
      setLeads(data.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load deals");
    } finally {
      setLoading(false);
    }
  }

  async function moveLead(leadId: string, nextStatus: string) {
    try {
      setBusy(leadId + nextStatus);
      setError("");
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, nextStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not update deal");
      setMessage(data.lead.name + " moved to " + nextStatus + ".");
      await loadDeals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update deal");
    } finally {
      setBusy("");
    }
  }

  useEffect(() => {
    loadDeals();
  }, []);

  const contacted = useMemo(() => leads.filter((lead) => lead.status === "CONTACTED"), [leads]);
  const interested = useMemo(() => leads.filter((lead) => lead.status === "INTERESTED"), [leads]);
  const clients = useMemo(() => leads.filter((lead) => lead.status === "CLIENT"), [leads]);
  const lost = useMemo(() => leads.filter((lead) => lead.status === "LOST"), [leads]);

  function card(lead: Lead) {
    return (
      <div className="item" key={lead.id}>
        <strong>{lead.name}</strong>
        <p>{lead.niche} • {lead.city}, {lead.state}</p>
        <p>{lead.email || "No email"}</p>
        <span className="badge">{lead.status}</span>
        <div className="item-actions">
          <button className="secondary button-reset small" disabled={busy === lead.id + "INTERESTED"} onClick={() => moveLead(lead.id, "INTERESTED")}>Interested</button>
          <button className="primary button-reset small" disabled={busy === lead.id + "CLIENT"} onClick={() => moveLead(lead.id, "CLIENT")}>Client</button>
          <button className="secondary button-reset small" disabled={busy === lead.id + "LOST"} onClick={() => moveLead(lead.id, "LOST")}>Lost</button>
        </div>
      </div>
    );
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Deals</div>
        <h1>Deal Tracker</h1>
        <p>Move leads from waiting reply to interested, client, or lost.</p>
        <div className="actions">
          <a className="secondary" href="/">Back</a>
          <a className="secondary" href="/pipeline">Pipeline</a>
          <a className="secondary" href="/followups">Follow-ups</a>
          <button className="secondary button-reset" onClick={loadDeals}>Refresh</button>
        </div>
        {error ? <p className="error">{error}</p> : message ? <p className="success">{message}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Waiting</span><strong>{contacted.length}</strong></div>
        <div className="card"><span>Interested</span><strong>{interested.length}</strong></div>
        <div className="card"><span>Clients</span><strong>{clients.length}</strong></div>
        <div className="card"><span>Lost</span><strong>{lost.length}</strong></div>
      </section>

      <section className="board">
        <div className="card"><h2>Waiting Reply</h2>{loading ? <div className="item">Loading...</div> : null}{contacted.map(card)}</div>
        <div className="card"><h2>Interested</h2>{interested.map(card)}</div>
      </section>
      <section className="board">
        <div className="card"><h2>Clients</h2>{clients.map(card)}</div>
        <div className="card"><h2>Lost</h2>{lost.map(card)}</div>
      </section>
    </main>
  );
}
