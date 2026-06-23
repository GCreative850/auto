"use client";

import { useState } from "react";

export default function Page() {
  const [started, setStarted] = useState(false);

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
          <a className="secondary" href="/api/health">Health Check</a>
        </div>
        <p>{started ? "8 leads found. 5 drafts created. 0 emails sent without approval." : "Waiting to start."}</p>
      </section>

      <section className="grid">
        <div className="card"><span>Leads</span><strong>{started ? 8 : 0}</strong></div>
        <div className="card"><span>Drafts</span><strong>{started ? 5 : 0}</strong></div>
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
          <div className="item"><strong>Emerald Coast Med Spa</strong><p>Med Spa</p><span className="badge">New Lead</span></div>
          <div className="item"><strong>Precision Roofing Co</strong><p>Roofing</p><span className="badge">Draft Ready</span></div>
          <div className="item"><strong>Gulf Breeze Auto Detail</strong><p>Auto Detail</p><span className="badge">Ready</span></div>
        </div>
      </section>
    </main>
  );
}
