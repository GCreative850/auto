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

function gmailComposeUrl(draft: OutreachDraft) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: draft.lead?.email || "",
    su: draft.subject,
    body: draft.body
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

export default function Page() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draftLoading, setDraftLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [finderLoading, setFinderLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [bulkDraftLoading, setBulkDraftLoading] = useState(false);
  const [autoRunLoading, setAutoRunLoading] = useState(false);
  const [finderNiche, setFinderNiche] = useState("Med Spa");
  const [finderCity, setFinderCity] = useState("Pensacola");
  const [finderState, setFinderState] = useState("FL");
  const [finderMessage, setFinderMessage] = useState("");
  const [manualImportText, setManualImportText] = useState("Emerald Coast Detailing | Mobile Detailing | Pensacola | FL | | https://example.com | 82");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
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

  async function loadDrafts() {
    try {
      const res = await fetch("/api/outreach/drafts", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load drafts");
      setDrafts(data.drafts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load drafts");
    }
  }

  async function refreshAll() {
    await Promise.all([loadLeads(), loadDrafts()]);
  }

  async function seedLeads() {
    await fetch("/api/leads/seed", { cache: "no-store" });
    await loadLeads();
  }

  async function findRealLeads() {
    try {
      setFinderLoading(true);
      setFinderMessage("");
      setError("");
      const res = await fetch("/api/leads/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: finderNiche, city: finderCity, state: finderState })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Lead finder failed");
      setFinderMessage(`Imported ${data.importedCount} new leads. Skipped ${data.skippedCount} duplicates.`);
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lead finder failed");
    } finally {
      setFinderLoading(false);
    }
  }

  async function enrichEmails() {
    try {
      setEmailLoading(true);
      setFinderMessage("");
      setError("");
      const res = await fetch("/api/leads/enrich-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 10 })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Email enrichment failed");
      setFinderMessage(`Checked ${data.checkedCount} websites and found ${data.updatedCount} emails.`);
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email enrichment failed");
    } finally {
      setEmailLoading(false);
    }
  }

  async function createBulkDrafts() {
    try {
      setBulkDraftLoading(true);
      setFinderMessage("");
      setError("");
      const res = await fetch("/api/outreach/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulk: true })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Bulk draft creation failed");
      setFinderMessage(`Created ${data.createdCount} new drafts for email-ready leads.`);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk draft creation failed");
    } finally {
      setBulkDraftLoading(false);
    }
  }

  async function autoRunDay() {
    try {
      setAutoRunLoading(true);
      setStarted(true);
      setFinderMessage("Running Auto Day: finding leads...");
      setError("");

      const leadRes = await fetch("/api/leads/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: finderNiche, city: finderCity, state: finderState })
      });
      const leadData = await leadRes.json();
      if (!leadRes.ok || !leadData.ok) throw new Error(leadData.error || "Lead finder failed");

      setFinderMessage("Running Auto Day: finding emails...");
      const emailRes = await fetch("/api/leads/enrich-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 10 })
      });
      const emailData = await emailRes.json();
      if (!emailRes.ok || !emailData.ok) throw new Error(emailData.error || "Email enrichment failed");

      setFinderMessage("Running Auto Day: creating drafts...");
      const draftRes = await fetch("/api/outreach/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulk: true })
      });
      const draftData = await draftRes.json();
      if (!draftRes.ok || !draftData.ok) throw new Error(draftData.error || "Bulk draft creation failed");

      setFinderMessage(`Auto Day complete: ${leadData.importedCount} leads imported, ${emailData.updatedCount} emails found, ${draftData.createdCount} drafts created.`);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto Day failed");
    } finally {
      setAutoRunLoading(false);
    }
  }

  async function importManualLeads() {
    try {
      setImportLoading(true);
      setFinderMessage("");
      setError("");
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: manualImportText, niche: finderNiche, city: finderCity, state: finderState })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Manual import failed");
      setFinderMessage(`Manual import added ${data.importedCount} leads. Skipped ${data.skippedCount} duplicates.`);
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Manual import failed");
    } finally {
      setImportLoading(false);
    }
  }

  async function createDraft(leadId: string) {
    try {
      setDraftLoading(true);
      setError("");
      const res = await fetch("/api/outreach/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to create draft");
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create draft");
    } finally {
      setDraftLoading(false);
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
  const leadsWithEmail = useMemo(() => leads.filter((lead) => Boolean(lead.email)).length, [leads]);

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ • v0.9 Auto Run + Gmail</div>
        <h1>Good Morning Gregory</h1>
        <p>Run the daily lead workflow, create drafts in bulk, approve them, then open Gmail drafts from inside AutoHQ.</p>
        <div className="actions">
          <button className="primary" disabled={autoRunLoading} onClick={autoRunDay}>
            {autoRunLoading ? "Auto Running..." : "Auto Run Day"}
          </button>
          <button className="secondary button-reset" onClick={() => setStarted(true)}>
            {started ? "Workflow Started" : "Start Good Morning"}
          </button>
          <button className="secondary button-reset" onClick={refreshAll}>Refresh</button>
          <a className="secondary" href="/gmail-drafts">Gmail Drafts</a>
          <a className="secondary" href="/api/health">Health Check</a>
        </div>
        <p>
          {started
            ? `${leads.length} leads loaded. ${leadsWithEmail} emails found. ${drafts.length} drafts created. ${approvedDrafts} approved.`
            : loading
              ? "Loading database leads..."
              : "Waiting to start."}
        </p>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="card finder-card">
        <h2>Real Lead Finder</h2>
        <p>Use Google to find businesses, scan websites for public contact emails, then create drafts for all email-ready leads.</p>
        <div className="finder-form">
          <label>
            Niche
            <input value={finderNiche} onChange={(event) => setFinderNiche(event.target.value)} placeholder="Med Spa" />
          </label>
          <label>
            City
            <input value={finderCity} onChange={(event) => setFinderCity(event.target.value)} placeholder="Pensacola" />
          </label>
          <label>
            State
            <input value={finderState} onChange={(event) => setFinderState(event.target.value)} placeholder="FL" />
          </label>
          <button className="primary button-reset" disabled={finderLoading} onClick={findRealLeads}>
            {finderLoading ? "Finding..." : "Find With Google"}
          </button>
        </div>
        <div className="actions enrichment-actions">
          <button className="secondary button-reset" disabled={emailLoading} onClick={enrichEmails}>
            {emailLoading ? "Finding Emails..." : "Find Contact Emails"}
          </button>
          <button className="secondary button-reset" disabled={bulkDraftLoading} onClick={createBulkDrafts}>
            {bulkDraftLoading ? "Creating Drafts..." : "Create Drafts for All Email Leads"}
          </button>
        </div>
        <div className="manual-import">
          <label>
            Manual Real Lead Import
            <textarea value={manualImportText} onChange={(event) => setManualImportText(event.target.value)} />
          </label>
          <p>Format per line: Business Name | Niche | City | State | Email | Website | Score</p>
          <button className="secondary button-reset" disabled={importLoading} onClick={importManualLeads}>
            {importLoading ? "Importing..." : "Import Manual Leads"}
          </button>
        </div>
        {finderMessage ? <p className="success">{finderMessage}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Leads</span><strong>{leads.length}</strong></div>
        <div className="card"><span>Emails</span><strong>{leadsWithEmail}</strong></div>
        <div className="card"><span>Drafts</span><strong>{drafts.length}</strong></div>
        <div className="card"><span>Approved</span><strong>{approvedDrafts}</strong></div>
      </section>

      <section className="board">
        <div className="card">
          <h2>CRM Preview</h2>
          {loading ? <div className="item">Loading leads...</div> : null}
          {!loading && !leads.length ? (
            <div className="item">
              <strong>No leads yet</strong>
              <p>Click Auto Run Day or Find With Google to import real businesses.</p>
              <span className="badge">Empty</span>
            </div>
          ) : null}
          {leads.map((lead) => (
            <div className="item" key={lead.id}>
              <strong>{lead.name}</strong>
              <p>{lead.niche} • {lead.city}, {lead.state}</p>
              {lead.email ? <p>{lead.email}</p> : <p>No email found yet</p>}
              {lead.website ? <p>{lead.website}</p> : null}
              <span className="badge">Score {lead.score} • {lead.status}</span>
              <div className="item-actions">
                <button className="secondary button-reset small" disabled={draftLoading} onClick={() => createDraft(lead.id)}>
                  Create Outreach Draft
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h2>Outreach Drafts</h2>
          {!drafts.length ? (
            <div className="item">
              <strong>No drafts yet</strong>
              <p>Create a draft from a lead. Emails still require manual approval.</p>
              <span className="badge">Manual Approval</span>
            </div>
          ) : null}
          {drafts.map((draft) => (
            <div className="item" key={draft.id}>
              <strong>{draft.subject}</strong>
              <p>{draft.lead?.name || "Lead"} • {draft.status}</p>
              <pre>{draft.body}</pre>
              {draft.status === "DRAFT" ? (
                <button className="secondary button-reset small" disabled={approvalLoading} onClick={() => approveDraft(draft.id)}>
                  Approve Draft
                </button>
              ) : draft.lead?.email ? (
                <div className="item-actions">
                  <a className="secondary small" href={gmailComposeUrl(draft)} target="_blank" rel="noreferrer">Open Gmail Draft</a>
                  <a className="secondary small" href="/gmail-drafts">All Gmail Drafts</a>
                </div>
              ) : (
                <span className="badge">Approved</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
