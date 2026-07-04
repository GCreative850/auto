"use client";

import { useState } from "react";

type StepResult = {
  ok: boolean;
  status: number;
  data?: Record<string, unknown>;
};

export default function AutomationPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<StepResult[]>([]);
  const [niche, setNiche] = useState("Med Spa");
  const [city, setCity] = useState("Pensacola");
  const [state, setState] = useState("FL");
  const [limit, setLimit] = useState("10");

  async function runNow() {
    try {
      setLoading(true);
      setMessage("Running automation...");
      setError("");
      const res = await fetch("/api/automation/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, city, state, limit: Number(limit) })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Automation failed");
      setResults(data.results || []);
      setMessage(`Completed ${data.successCount}/${data.totalSteps} steps for ${data.niche} in ${data.city}, ${data.state}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Automation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Automation</div>
        <h1>Automation Scheduler</h1>
        <p>Run lead search, email finding, draft creation, and Gmail reply scan. Sending stays manual.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/status">Status</a>
          <a className="secondary" href="/command-center">Command Center</a>
          <button className="primary button-reset" disabled={loading} onClick={runNow}>{loading ? "Running..." : "Run Automation Now"}</button>
        </div>
        {error ? <p className="error">{error}</p> : message ? <p className="success">{message}</p> : null}
      </section>

      <section className="card finder-card">
        <h2>Run Settings</h2>
        <div className="finder-form">
          <label>Niche<input value={niche} onChange={(event) => setNiche(event.target.value)} /></label>
          <label>City<input value={city} onChange={(event) => setCity(event.target.value)} /></label>
          <label>State<input value={state} onChange={(event) => setState(event.target.value)} /></label>
          <label>Email Limit<input value={limit} onChange={(event) => setLimit(event.target.value)} /></label>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span>Lead Search</span><strong>Ready</strong></div>
        <div className="card"><span>Email Finder</span><strong>Ready</strong></div>
        <div className="card"><span>Drafts</span><strong>Review</strong></div>
        <div className="card"><span>Sending</span><strong>Manual</strong></div>
      </section>

      <section className="card">
        <h2>Run Results</h2>
        {!results.length ? <div className="item"><strong>No run yet.</strong><p>Choose settings, then run automation.</p></div> : null}
        {results.map((result, index) => (
          <div className="item" key={index}>
            <strong>Step {index + 1}</strong>
            <p>Status {result.status}</p>
            <span className="badge">{result.ok ? "OK" : "Needs Check"}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
