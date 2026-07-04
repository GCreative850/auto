"use client";

import { useEffect, useState } from "react";

type Counts = {
  leads: number;
  emails: number;
  drafts: number;
  approved: number;
  sent: number;
  interested: number;
  clients: number;
};

export default function StatusPage() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStatus() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/automation/status", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Status failed");
      setCounts(data.counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status failed");
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
        <div className="kicker">AutoHQ Status</div>
        <h1>Status Board</h1>
        <p>Quick view of your AutoHQ numbers.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/automation">Automation</a>
          <a className="secondary" href="/command-center">Command Center</a>
          <button className="secondary button-reset" onClick={loadStatus}>Refresh</button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Leads</span><strong>{loading ? "..." : counts?.leads ?? 0}</strong></div>
        <div className="card"><span>Emails</span><strong>{loading ? "..." : counts?.emails ?? 0}</strong></div>
        <div className="card"><span>Drafts</span><strong>{loading ? "..." : counts?.drafts ?? 0}</strong></div>
        <div className="card"><span>Approved</span><strong>{loading ? "..." : counts?.approved ?? 0}</strong></div>
        <div className="card"><span>Sent</span><strong>{loading ? "..." : counts?.sent ?? 0}</strong></div>
        <div className="card"><span>Interested</span><strong>{loading ? "..." : counts?.interested ?? 0}</strong></div>
        <div className="card"><span>Clients</span><strong>{loading ? "..." : counts?.clients ?? 0}</strong></div>
      </section>
    </main>
  );
}
