"use client";

const offers = [
  {
    name: "Free Custom Mockup",
    price: "$0",
    detail: "Personalized mobile lead-page concept built from the prospect's existing public website and business information."
  },
  {
    name: "Lead Page Launch",
    price: "$450",
    detail: "Mobile landing page, click-to-call, quote form, services, reviews, service area, basic SEO structure, and Vercel deployment."
  },
  {
    name: "Care Plan",
    price: "$99/mo",
    detail: "Optional ongoing text, photo, offer, and service updates after launch."
  }
];

const closeScript = `I can build the mockup first so you can see the direction before paying. If you want it live, the full launch is $450 and includes the mobile lead page, click-to-call, estimate form, reviews/service copy, and deployment. Ongoing updates are optional at $99/month. Want me to make the mockup?`;
const outreachScript = `Hey — I build focused mobile lead pages for local service businesses. I noticed a few places where your current website could make it faster for visitors to call or request an estimate. I can mock up a personalized version first at no obligation. If you like it, launch is $450. Want me to send the mockup?`;

export default function MoneyModePage() {
  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Money Mode</div>
        <h1>$1,300 Sprint Offer</h1>
        <p>Close 3 standard launches and the target is covered.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="primary" href="/package">Business Package</a>
          <a className="secondary" href="/broad">Broad Markets</a>
          <a className="secondary" href="/send-queue">Send Queue</a>
          <a className="secondary" href="/deals">Deals</a>
        </div>
      </section>

      <section className="grid">
        {offers.map((offer) => (
          <div className="card" key={offer.name}>
            <span>{offer.name}</span>
            <strong>{offer.price}</strong>
            <p>{offer.detail}</p>
          </div>
        ))}
      </section>

      <section className="board">
        <div className="card">
          <h2>Cold Outreach</h2>
          <div className="item">
            <p>{outreachScript}</p>
            <button className="primary button-reset small" onClick={() => copyText(outreachScript)}>Copy Outreach</button>
          </div>
        </div>
        <div className="card">
          <h2>Close Message</h2>
          <div className="item">
            <p>{closeScript}</p>
            <button className="primary button-reset small" onClick={() => copyText(closeScript)}>Copy Close</button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Target</h2>
        <div className="item"><strong>3 × $450 = $1,350</strong><p>Prioritize businesses where one new job can easily justify the setup fee.</p></div>
        <div className="item"><strong>Mockup first</strong><p>Use personalization to earn the reply instead of competing on generic website pricing.</p></div>
      </section>
    </main>
  );
}
