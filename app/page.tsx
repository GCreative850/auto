"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: string;
  name: string;
  niche: string;
  city: string;
  state: string;
  email: string | null;
  website: string | null;
  score: number;
  status: string;
};

export default function Page() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");

  async function loadLeads() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/leads", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load leads");
      setLeads(data.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  async function seedLeads() {
    await fetch("/api/leads/seed", { cache: "no-store" });
    await loadLeads();
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const averageScore = useMemo(() => {
    if (!leads.length) return 0;
    return Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length);
  }, [leads]);

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ</div>
        <h1>Good Morning Gregory</h1>
        <p>Start the daily outreach workflow from one dashboard.</p>
        <div className="actions">
          <button className="primary" onClick={() => setStarted(true)}>
            {started ? "Workflow Started" : "Start Good Morning"}
          </button>
          <button className="secondary button-reset" onClick={loadLeads}>Refresh Leads</button>
          <button className="secondary button-reset" onClick={seedLeads}>Seed Test Leads</button>
          <a className="secondary" href="/api/health">Health Check</a>
        </div>
        <p>
          {started
            ? `${leads.length} database leads loaded. Draft creation is next. No emails sent without approval.`
            : loading
              ? "Loading database leads..."
              : "Waiting to start."}
        </p>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Leads</span><strong>{leads.length}</strong></div>
        <div className="card"><span>Avg Score</span><strong>{averageScore}</strong></div>
        <div className="card"><span>Sent</span><strong>0</strong></div>
        <div className="card"><span>Approval</span><strong>ON</strong></div>
      </section>

      <section className="board">
        <div className="card">
          <h2>Workflow</h2>
          <div className="item">Find businesses</div>
          <div className="item">Score leads</div>
          <div className="item">Create drafts</div>
          <div className="item">Update CRM</div>
        </div>
        <div className="card">
          <h2>CRM Preview</h2>
          {loading ? <div className="item">Loading leads...</div> : null}
          {!loading && !leads.length ? (
            <div className="item">
              <strong>No leads yet</strong>
              <p>Click Seed Test Leads to add the first database records.</p>
              <span className="badge">Empty</span>
            </div>
          ) : null}
          {leads.map((lead) => (
            <div className="item" key={lead.id}>
              <strong>{lead.name}</strong>
              <p>{lead.niche} • {lead.city}, {lead.state}</p>
              <span className="badge">Score {lead.score} • {lead.status}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
