"use client";

export default function CommandCenterPage() {
  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Command Center</div>
        <h1>Daily Command Center</h1>
        <p>One page for outreach, payment, and fulfillment.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/business-package">Business Package</a>
          <a className="secondary" href="/pay">Pay</a>
          <a className="secondary" href="/start">Start Details</a>
          <a className="secondary" href="/fulfillment">Fulfillment</a>
          <a className="secondary" href="/deals">Deals</a>
        </div>
      </section>

      <section className="grid">
        <a className="card" href="/broad"><span>Step 1</span><strong>Broad Markets</strong><p>Pick the business type and city.</p></a>
        <a className="card" href="/automation"><span>Step 2</span><strong>Run Automation</strong><p>Find leads, emails, drafts, and reply checks.</p></a>
        <a className="card" href="/send-queue"><span>Step 3</span><strong>Send Queue</strong><p>Open approved emails and run checker.</p></a>
        <a className="card" href="/business-package"><span>Step 4</span><strong>Business Package</strong><p>Clean client-facing offer page.</p></a>
        <a className="card" href="/pay"><span>Step 5</span><strong>Payment Page</strong><p>Cash App payment buttons for packages.</p></a>
        <a className="card" href="/fulfillment"><span>Step 6</span><strong>Fulfillment</strong><p>Deliver the concept and upsell monthly.</p></a>
      </section>
    </main>
  );
}
