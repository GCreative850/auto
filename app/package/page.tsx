"use client";

const packages = [
  {
    name: "Custom Mockup",
    price: "$0",
    bestFor: "First reply",
    deliverables: ["Personalized concept", "Mobile-first direction", "Built from public business info", "No obligation"]
  },
  {
    name: "Lead Page Launch",
    price: "$450",
    bestFor: "Main close",
    deliverables: ["Mobile landing page", "Click-to-call + estimate form", "Reviews/services/service area", "Basic SEO structure + deployment"]
  },
  {
    name: "Care Plan",
    price: "$99/mo",
    bestFor: "Recurring revenue",
    deliverables: ["Small content edits", "Offer/service updates", "Photo swaps", "Ongoing page maintenance"]
  }
];

const packagePitch = `I build focused mobile lead pages for service businesses. I can make a personalized mockup first at no obligation. If you like it, the full launch is $450 and includes click-to-call, an estimate form, services, reviews, service-area copy, basic SEO structure, and deployment. Ongoing updates are optional at $99/month.`;
const paymentClose = `Great — if you want the mockup launched, the setup is $450. Once payment is sent, I’ll finalize the business details, contact flow, and branding and publish the live version.`;
const scopeMessage = `Included: one conversion-focused lead page, mobile optimization, click-to-call, estimate/contact form, service/review/service-area sections, basic SEO structure, and deployment. Not included: paid ads, guaranteed sales/leads, guaranteed search rankings, full custom software, or a large multi-page rebuild unless separately quoted.`;

export default function PackagePage() {
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Package</div>
        <h1>Website Lead-Page Offer</h1>
        <p>Use the free mockup to earn interest, then close the $450 launch.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/money-mode">Money Mode</a>
          <a className="secondary" href="/send-queue">Send Queue</a>
          <a className="secondary" href="/deals">Deals</a>
        </div>
      </section>

      <section className="grid">
        {packages.map((pkg) => (
          <div className="card" key={pkg.name}>
            <span>{pkg.bestFor}</span>
            <strong>{pkg.name}</strong>
            <h2>{pkg.price}</h2>
            {pkg.deliverables.map((item) => <p key={item}>• {item}</p>)}
          </div>
        ))}
      </section>

      <section className="board">
        <div className="card">
          <h2>Package Pitch</h2>
          <div className="item">
            <p>{packagePitch}</p>
            <button className="primary button-reset small" onClick={() => copy(packagePitch)}>Copy Pitch</button>
          </div>
        </div>
        <div className="card">
          <h2>Payment Close</h2>
          <div className="item">
            <p>{paymentClose}</p>
            <button className="primary button-reset small" onClick={() => copy(paymentClose)}>Copy Close</button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Scope</h2>
        <div className="item">
          <p>{scopeMessage}</p>
          <button className="secondary button-reset small" onClick={() => copy(scopeMessage)}>Copy Scope</button>
        </div>
      </section>
    </main>
  );
}
