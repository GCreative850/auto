export default function BusinessPackagePage() {
  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">GCCreative / AutoHQ AI</div>
        <h1>Turn More Website Visits Into Calls & Estimate Requests</h1>
        <p>We build focused mobile lead pages for local service businesses using your existing brand, services, reviews, photos, and contact information.</p>
        <div className="actions">
          <a className="primary" href="/start">Request Free Mockup</a>
          <a className="secondary" href="#packages">View Pricing</a>
        </div>
      </section>

      <section className="grid" id="packages">
        <div className="card">
          <span>No obligation</span>
          <strong>Custom Mockup</strong>
          <h2>$0</h2>
          <p>1 personalized homepage/lead-page concept</p>
          <p>Built around your current business</p>
          <p>See the direction before paying</p>
        </div>
        <div className="card">
          <span>Main Offer</span>
          <strong>Lead Page Launch</strong>
          <h2>$450</h2>
          <p>Mobile-first landing page</p>
          <p>Click-to-call + estimate form</p>
          <p>Services, reviews, service area, CTA</p>
          <p>Basic local SEO structure + Vercel deployment</p>
        </div>
        <div className="card">
          <span>Optional</span>
          <strong>Care Plan</strong>
          <h2>$99/mo</h2>
          <p>Text/photo/service updates</p>
          <p>Offer changes and small edits</p>
          <p>Landing-page maintenance</p>
          <p>Cancel anytime</p>
        </div>
      </section>

      <section className="board">
        <div className="card">
          <h2>How It Works</h2>
          <div className="item"><strong>1. We make the mockup</strong><p>We use your public website/business information to build a personalized concept.</p></div>
          <div className="item"><strong>2. You approve it</strong><p>If the direction makes sense, we finalize the copy, contact flow, and branding.</p></div>
          <div className="item"><strong>3. We launch it</strong><p>Pay the $450 setup and we publish the finished page to Vercel and hand over the live link.</p></div>
        </div>
        <div className="card">
          <h2>Best Fit</h2>
          <div className="item"><p>Roofers, HVAC, plumbers, pressure washing, tree service, landscapers, electricians, med spas, dentists, contractors, cleaners, and other appointment/quote-driven businesses.</p></div>
        </div>
      </section>

      <section className="card">
        <h2>Clear Scope</h2>
        <div className="item">
          <strong>This is a conversion-focused web page, not a promise of sales.</strong>
          <p>Paid ads, full multi-page rebuilds, custom software, guaranteed leads, and guaranteed SEO rankings are not included unless separately quoted.</p>
          <a className="primary small" href="/start">Request Your Free Mockup</a>
        </div>
      </section>
    </main>
  );
}
