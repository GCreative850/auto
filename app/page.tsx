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

type OutreachDraft = {
  id: string;
  leadId: string;
  subject: string;
  body: string;
  status: string;
  lead?: Lead;
};

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [finderLoading, setFinderLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [bulkDraftLoading, setBulkDraftLoading] = useState(false);
  const [autoRunLoading, setAutoRunLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [finderNiche, setFinderNiche] = useState("Med Spa");
  const [finderCity, setFinderCity] = useState("Pensacola");
  const [finderState, setFinderState] = useState("FL");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadLeads() {
    const res = await fetch("/api/leads", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load leads");
    setLeads(data.leads || []);
  }

  async function loadDrafts() {
    const res = await fetch("/api/outreach/drafts", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load drafts");
    setDrafts(data.drafts || []);
  }

  async function refreshAll() {
    try {
      setLoading(true);
      setError("");
      await Promise.all([loadLeads(), loadDrafts()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setLoading(false);
    }
  }

  async function findRealLeads() {
    try {
      setFinderLoading(true);
      setMessage("");
      setError("");
      const res = await fetch("/api/leads/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: finderNiche, city: finderCity, state: finderState })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Lead finder failed");
      setMessage(`Imported ${data.importedCount} new leads. Skipped ${data.skippedCount} duplicates.`);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lead finder failed");
    } finally {
      setFinderLoading(false);
    }
  }

  async function enrichEmails() {
    try {
      setEmailLoading(true);
      setMessage("");
      setError("");
      const res = await fetch("/api/leads/enrich-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 10 })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Email enrichment failed");
      setMessage(`Checked ${data.checkedCount} websites and found ${data.updatedCount} emails.`);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email enrichment failed");
    } finally {
      setEmailLoading(false);
    }
  }

  async function createBulkDrafts() {
    try {
      setBulkDraftLoading(true);
      setMessage("");
      setError("");
      const res = await fetch("/api/outreach/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulk: true })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Draft creation failed");
      setMessage(`Created ${data.createdCount} new drafts.`);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft creation failed");
    } finally {
      setBulkDraftLoading(false);
    }
  }

  async function autoRunDay() {
    try {
      setAutoRunLoading(true);
      setMessage("Running Auto Day...");
      setError("");

      await findRealLeads();
      await enrichEmails();
      await createBulkDrafts();

      setMessage("Auto Day complete. Review drafts, then use Pipeline.");
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto Day failed");
    } finally {
      setAutoRunLoading(false);
    }
  }

  async function approveDraft(draftId: string) {
    try {
      setApprovalLoading(true);
      setError("");
      const res = await fetch("/api/outreach/drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId, status: "APPROVED" })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to approve draft");
      setMessage("Draft approved. Open Pipeline or Gmail Drafts next.");
      await loadDrafts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve draft");
    } finally {
      setApprovalLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  const approvedDrafts = useMemo(() => drafts.filter((draft) => draft.status === "APPROVED").length, [drafts]);
  const sentDrafts = useMemo(() => drafts.filter((draft) => draft.status === "SENT").length, [drafts]);
  const leadsWithEmail = useMemo(() => leads.filter((lead) => Boolean(lead.email)).length, [leads]);
  const draftLeadCount = useMemo(() => new Set(drafts.map((draft) => draft.leadId)).size, [drafts]);
  const draftEmailCount = useMemo(() => new Set(drafts.map((draft) => draft.lead?.email).filter((email): email is string => Boolean(email))).size, [drafts]);
  const displayLeadCount = Math.max(leads.length, draftLeadCount);
  const displayEmailCount = Math.max(leadsWithEmail, draftEmailCount);

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ • v1.1 Full Dashboard</div>
        <h1>Good Morning Gregory</h1>
        <p>Everything is now connected here: leads, drafts, Gmail, pipeline, follow-ups, and deals.</p>
        <div className="actions">
          <button className="primary" disabled={autoRunLoading} onClick={autoRunDay}>
            {autoRunLoading ? "Auto Running..." : "Auto Run Day"}
          </button>
          <button className="secondary button-reset" onClick={refreshAll}>Refresh</button>
          <a className="secondary" href="/pipeline">Pipeline</a>
          <a className="secondary" href="/followups">Follow-ups</a>
          <a className="secondary" href="/deals">Deals</a>
          <a className="secondary" href="/gmail-drafts">Gmail Drafts</a>
          <a className="secondary" href="/api/health">Health Check</a>
        </div>
        <p>
          {loading
            ? "Loading dashboard..."
            : `${displayLeadCount} leads. ${displayEmailCount} emails. ${drafts.length} drafts. ${approvedDrafts} approved. ${sentDrafts} sent.`}
        </p>
        {error ? <p className="error">{error}</p> : message ? <p className="success">{message}</p> : null}
      </section>

      <section className="grid">
        <a className="card" href="/">
          <span>Step 1</span><strong>Find Leads</strong><p>Run Auto Day and create drafts.</p>
        </a>
        <a className="card" href="/pipeline">
          <span>Step 2</span><strong>Pipeline</strong><p>Send approved drafts and mark sent.</p>
        </a>
        <a className="card" href="/followups">
          <span>Step 3</span><strong>Follow-ups</strong><p>Create follow-up drafts.</p>
        </a>
        <a className="card" href="/deals">
          <span>Step 4</span><strong>Deals</strong><p>Track interested, client, or lost.</p>
        </a>
      </section>

      <section className="card finder-card">
        <h2>Real Lead Finder</h2>
        <p>Find businesses, scan websites for emails, then create drafts for all email-ready leads.</p>
        <div className="finder-form">
          <label>Niche<input value={finderNiche} onChange={(event) => setFinderNiche(event.target.value)} placeholder="Med Spa" /></label>
          <label>City<input value={finderCity} onChange={(event) => setFinderCity(event.target.value)} placeholder="Pensacola" /></label>
          <label>State<input value={finderState} onChange={(event) => setFinderState(event.target.value)} placeholder="FL" /></label>
          <button className="primary button-reset" disabled={finderLoading} onClick={findRealLeads}>{finderLoading ? "Finding..." : "Find With Google"}</button>
        </div>
        <div className="actions enrichment-actions">
          <button className="secondary button-reset" disabled={emailLoading} onClick={enrichEmails}>{emailLoading ? "Finding Emails..." : "Find Contact Emails"}</button>
          <button className="secondary button-reset" disabled={bulkDraftLoading} onClick={createBulkDrafts}>{bulkDraftLoading ? "Creating Drafts..." : "Create Drafts for All Email Leads"}</button>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span>Leads</span><strong>{displayLeadCount}</strong></div>
        <div className="card"><span>Emails</span><strong>{displayEmailCount}</strong></div>
        <div className="card"><span>Drafts</span><strong>{drafts.length}</strong></div>
        <div className="card"><span>Approved</span><strong>{approvedDrafts}</strong></div>
      </section>

      <section className="board">
        <div className="card">
          <h2>CRM Preview</h2>
          {loading ? <div className="item">Loading leads...</div> : null}
          {!loading && !leads.length ? (
            <div className="item"><strong>No CRM lead rows loaded</strong><p>Your draft lead data is still counted. Click Refresh or run a new search.</p><span className="badge">Drafts Still Saved</span></div>
          ) : null}
          {leads.map((lead) => (
            <div className="item" key={lead.id}>
              <strong>{lead.name}</strong>
              <p>{lead.niche} • {lead.city}, {lead.state}</p>
              <p>{lead.email || "No email found yet"}</p>
              {lead.website ? <p>{lead.website}</p> : null}
              <span className="badge">Score {lead.score} • {lead.status}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>Draft Review</h2>
          {!drafts.length ? <div className="item"><strong>No drafts yet</strong><p>Run Auto Day or create drafts for email leads.</p></div> : null}
          {drafts.map((draft) => (
            <div className="item" key={draft.id}>
              <strong>{draft.subject}</strong>
              <p>{draft.lead?.name || "Lead"} • {draft.status}</p>
              {draft.status === "DRAFT" ? (
                <button className="secondary button-reset small" disabled={approvalLoading} onClick={() => approveDraft(draft.id)}>Approve Draft</button>
              ) : (
                <span className="badge">{draft.status}</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
