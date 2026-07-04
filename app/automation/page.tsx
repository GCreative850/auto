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

  async function runNow() {
    try {
      setLoading(true);
      setMessage("Running safe automation...");
      setError("");
      const res = await fetch("/api/automation/daily", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Automation failed");
      setResults(data.results || []);
      setMessage(`Completed ${data.successCount}/${data.totalSteps} steps. No emails were sent.`);
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
        <p>Run the safe automation stack: leads, emails, drafts, and Gmail reply scan. It never sends emails automatically.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/command-center">Command Center</a>
          <button className="primary button-reset" disabled={loading} onClick={runNow}>{loading ? "Running..." : "Run Automation Now"}</button>
        </div>
        {error ? <p className="error">{error}</p> : message ? <p className="success">{message}</p> : null}
      </section>

      <section className="grid">
        <div className="card"><span>Lead Search</span><strong>Safe</strong></div>
        <div className="card"><span>Email Finder</span><strong>Safe</strong></div>
        <div className="card"><span>Drafts</span><strong>Review</strong></div>
        <div className="card"><span>Sending</span><strong>Manual</strong></div>
      </section>

      <section className="card">
        <h2>Run Results</h2>
        {!results.length ? <div className="item"><strong>No run yet.</strong><p>Click Run Automation Now to test the flow.</p></div> : null}
        {results.map((result, index) => (
          <div className="item" key={index}>
            <strong>Step {index + 1}</strong>
            <p>Status {result.status}</p>
            <span className="badge">{result.ok ? "OK" : "Needs Check"}</span>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Schedule</h2>
        <div className="item"><strong>Daily run target</strong><p>Once Vercel cron is enabled, this route can run daily in the morning.</p></div>
        <div className="item"><strong>Manual backup</strong><p>You can always run it from this page.</p></div>
      </section>
    </main>
  );
}
