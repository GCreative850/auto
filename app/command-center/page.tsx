"use client";

export default function CommandCenterPage() {
  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Command Center</div>
        <h1>Lead-Page Sales Command Center</h1>
        <p>One workflow from qualified prospect to mockup, payment, launch, and optional care plan.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/business-package">Client Offer</a>
          <a className="secondary" href="/money-mode">Money Mode</a>
          <a className="secondary" href="/deals">Deals</a>
        </div>
      </section>

      <section className="grid">
        <a className="card" href="/broad"><span>Step 1</span><strong>Broad Markets</strong><p>Choose a high-value niche and U.S. market.</p></a>
        <a className="card" href="/automation"><span>Step 2</span><strong>Run Automation</strong><p>Find leads, enrich emails, build drafts, and check replies.</p></a>
        <a className="card" href="/send-queue"><span>Step 3</span><strong>Send Queue</strong><p>Review outreach and avoid bad or duplicate recipients.</p></a>
        <a className="card" href="/concept-builder"><span>Step 4</span><strong>Mockup Builder</strong><p>Create the page structure and conversion copy for interested prospects.</p></a>
        <a className="card" href="/pay"><span>Step 5</span><strong>Payment</strong><p>Close the approved mockup at $450.</p></a>
        <a className="card" href="/fulfillment"><span>Step 6</span><strong>Launch</strong><p>Finalize details, deploy, verify, and hand off the live link.</p></a>
        <a className="card" href="/upsell"><span>Step 7</span><strong>Care Plan</strong><p>Offer optional $99/month maintenance after launch.</p></a>
      </section>
    </main>
  );
}
