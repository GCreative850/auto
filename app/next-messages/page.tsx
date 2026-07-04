"use client";

export default function NextMessagesPage() {
  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Next Messages</div>
        <h1>Next Messages</h1>
        <p>Use this area for interested leads after Gmail scan.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/inbox">Reply Tracker</a>
          <a className="secondary" href="/gmail-drafts">Gmail Drafts</a>
        </div>
      </section>
    </main>
  );
}
