export default function StartPage() {
  const mailto = "mailto:gccreative850@gmail.com?subject=Lead Page Start Details&body=Business name:%0AWebsite:%0ABest phone:%0ABest email:%0AService area:%0AMain service to feature:%0APreferred CTA (call / estimate / booking):%0ALogo/colors:%0AReviews or photos to feature:%0AAnything else:%0A";

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">GCCreative / AutoHQ AI</div>
        <h1>Start Your Lead Page</h1>
        <p>Use this page whether you are requesting the free mockup or sending final launch details after approving it.</p>
        <div className="actions">
          <a className="secondary" href="/business-package">View Package</a>
          <a className="secondary" href="/pay">Payment Page</a>
          <a className="primary" href={mailto}>Send Business Details</a>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span>Step 1</span><strong>Free Mockup</strong><p>Send your website and the main service you want more calls, estimates, or bookings for.</p></div>
        <div className="card"><span>Step 2</span><strong>Approve Direction</strong><p>Review the mockup before paying anything.</p></div>
        <div className="card"><span>Step 3</span><strong>$450 Launch</strong><p>After approval and payment, the page is finalized and deployed.</p></div>
        <div className="card"><span>Optional</span><strong>$99/mo Care Plan</strong><p>Small content, offer, photo, and service updates after launch.</p></div>
      </section>

      <section className="card">
        <h2>Send These Details</h2>
        <div className="item"><strong>Business + website</strong><p>The public information we should use as the starting point.</p></div>
        <div className="item"><strong>Best contact path</strong><p>Phone/email and whether the page should drive calls, estimate requests, or bookings.</p></div>
        <div className="item"><strong>Main service + service area</strong><p>The highest-priority offer and where you serve customers.</p></div>
        <div className="item"><strong>Trust proof</strong><p>Reviews, photos, warranties, years in business, licenses, guarantees, or differentiators you want featured.</p></div>
      </section>
    </main>
  );
}
