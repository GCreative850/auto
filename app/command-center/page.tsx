"use client";

export default function CommandCenterPage() {
  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Command Center</div>
        <h1>Daily Command Center</h1>
        <p>One page for today&apos;s work queue.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/pipeline">Pipeline</a>
          <a className="secondary" href="/inbox">Reply Tracker</a>
          <a className="secondary" href="/next-messages">Next Messages</a>
          <a className="secondary" href="/followups">Follow-ups</a>
          <a className="secondary" href="/deals">Deals</a>
        </div>
      </section>

      <section className="grid">
        <a className="card" href="/"><span>Step 1</span><strong>Find Leads</strong><p>Run the daily workflow.</p></a>
        <a className="card" href="/pipeline"><span>Step 2</span><strong>Pipeline</strong><p>Move approved outreach forward.</p></a>
        <a className="card" href="/inbox"><span>Step 3</span><strong>Reply Tracker</strong><p>Track who answered.</p></a>
        <a className="card" href="/next-messages"><span>Step 4</span><strong>Next Messages</strong><p>Create the next draft.</p></a>
        <a className="card" href="/followups"><span>Step 5</span><strong>Follow-ups</strong><p>Handle no-reply leads.</p></a>
        <a className="card" href="/deals"><span>Step 6</span><strong>Deals</strong><p>Track clients and archived leads.</p></a>
      </section>
    </main>
  );
}
