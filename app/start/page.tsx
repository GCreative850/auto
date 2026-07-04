export default function StartPage() {
  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">Gregory Crowell Creative</div>
        <h1>Start Your Promo Package</h1>
        <p>Choose a package, then send your business name, website or social link, and the service you want promoted.</p>
        <div className="actions">
          <a className="secondary" href="/business-package">View Packages</a>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span>Fast Start</span><strong>$49 Sample Starter</strong><p>One short promo concept, one caption, and one call-to-action.</p></div>
        <div className="card"><span>Best Test</span><strong>$99 Local Growth Pack</strong><p>Four short promo concepts with captions and simple posting plan.</p></div>
        <div className="card"><span>Recurring</span><strong>$199/mo Monthly Auto Content</strong><p>Eight content concepts per month with captions and direction.</p></div>
      </section>

      <section className="card">
        <h2>Send These Details</h2>
        <div className="item"><strong>Business name</strong><p>The name customers know you by.</p></div>
        <div className="item"><strong>Website or social link</strong><p>Any page that shows your services, photos, or offers.</p></div>
        <div className="item"><strong>Package choice</strong><p>$49 Sample, $99 Growth Pack, or $199 Monthly.</p></div>
        <div className="item"><strong>Service or offer to promote</strong><p>The main thing you want the promo content focused on.</p></div>
      </section>
    </main>
  );
}
