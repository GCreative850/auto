"use client";

export default function InboxPage() {
  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Inbox</div>
        <h1>Inbox Tracker</h1>
        <p>Track outreach responses from the site.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/pipeline">Pipeline</a>
          <a className="secondary" href="/deals">Deals</a>
        </div>
      </section>
    </main>
  );
}
