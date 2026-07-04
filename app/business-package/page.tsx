export default function BusinessPackagePage() {
  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">Gregory Crowell Creative</div>
        <h1>Short Promo Content for Local Businesses</h1>
        <p>We help local businesses turn their services, offers, photos, and existing online presence into short-form promo content for Instagram, TikTok, Facebook, and YouTube Shorts.</p>
        <div className="actions">
          <a className="primary" href="/pay">Start With $49 Sample</a>
          <a className="secondary" href="#packages">View Packages</a>
        </div>
      </section>

      <section className="grid" id="packages">
        <div className="card">
          <span>Fast Start</span>
          <strong>Sample Starter</strong>
          <h2>$49</h2>
          <p>1 short promo reel concept</p>
          <p>1 caption</p>
          <p>1 call-to-action</p>
          <p>24-48 hour concept delivery</p>
        </div>
        <div className="card">
          <span>Best Test</span>
          <strong>Local Growth Pack</strong>
          <h2>$99</h2>
          <p>4 short promo concepts</p>
          <p>4 captions</p>
          <p>Service or offer angle ideas</p>
          <p>Simple posting plan</p>
        </div>
        <div className="card">
          <span>Recurring</span>
          <strong>Monthly Auto Content</strong>
          <h2>$199/mo</h2>
          <p>8 short promo concepts</p>
          <p>8 captions</p>
          <p>Monthly content direction</p>
          <p>Ongoing promo ideas</p>
        </div>
      </section>

      <section className="board">
        <div className="card">
          <h2>How It Works</h2>
          <div className="item"><strong>1. Choose a package</strong><p>Start with the $49 sample or pick a monthly option.</p></div>
          <div className="item"><strong>2. Send your business info</strong><p>Website, social page, service, offer, or photos/videos you want used.</p></div>
          <div className="item"><strong>3. Get the content direction</strong><p>You receive a short promo concept, caption, hook, and call-to-action.</p></div>
        </div>
        <div className="card">
          <h2>Good For</h2>
          <div className="item"><p>Med spas, barbershops, salons, auto detailers, pressure washers, roofers, landscapers, dentists, HVAC companies, restaurants, and local service businesses.</p></div>
        </div>
      </section>

      <section className="card">
        <h2>Start Today</h2>
        <div className="item">
          <strong>Pay for the sample, then send your business name, website/social link, and the service you want promoted.</strong>
          <p>We will start with a simple content concept built around what your business already has.</p>
          <a className="primary small" href="/pay">Go To Payment</a>
        </div>
      </section>
    </main>
  );
}
