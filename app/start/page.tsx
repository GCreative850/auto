export default function StartPage() {
  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">Gregory Crowell Creative</div>
        <h1>Start Your Promo Package</h1>
        <p>After payment, send the details needed to build your short promo content.</p>
        <div className="actions">
          <a className="secondary" href="/business-package">View Packages</a>
          <a className="secondary" href="/pay">Payment Page</a>
          <a className="primary" href="mailto:gregorycrowell2002@gmail.com?subject=Promo Package Start Details&body=Business name:%0AWebsite or social link:%0APackage paid for:%0AService or offer to promote:%0ABest contact email:%0AAny notes:%0A">Email Start Details</a>
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
        <div className="item"><strong>Package paid for</strong><p>$49 Sample, $99 Growth Pack, or $199 Monthly.</p></div>
        <div className="item"><strong>Service or offer to promote</strong><p>The main thing you want the promo content focused on.</p></div>
        <div className="item"><strong>Best contact email</strong><p>Where to send the finished concept and any questions.</p></div>
      </section>
    </main>
  );
}
