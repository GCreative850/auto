"use client";

const packages = [
  {
    name: "Sample Starter",
    price: "$49",
    bestFor: "First yes today",
    deliverables: ["1 short promo reel concept", "1 caption", "1 call-to-action", "24-48 hour delivery"]
  },
  {
    name: "Local Growth Pack",
    price: "$99",
    bestFor: "Small business test package",
    deliverables: ["4 short promo concepts", "4 captions", "Service/offer angle ideas", "Simple posting plan"]
  },
  {
    name: "Monthly Auto Content",
    price: "$199/mo",
    bestFor: "Recurring client",
    deliverables: ["8 short promo concepts", "8 captions", "Monthly content direction", "Reply-ready content ideas"]
  }
];

const packagePitch = `I put together a simple local content package for businesses that want more attention online without having to film, edit, or post everything themselves. I can start with a $49 sample promo reel concept using your current website, photos, services, or social content. If you like it, the next package is $99 for 4 short promo pieces or $199/month for ongoing content.`;
const paymentClose = `The easiest way to start is the $49 sample. Once payment is sent, send me your website, Instagram/Facebook, or any photos/videos you want featured, and I will build the promo concept from there.`;
const scopeMessage = `What is included: short-form promo concept, caption, hook, and call-to-action. What is not included in the intro sample: paid ads, full social media management, filming on-site, or guaranteed sales. The goal is to give you usable content direction quickly.`;

export default function PackagePage() {
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Package</div>
        <h1>Business Outreach Package</h1>
        <p>Send this package to interested businesses and close the $49 intro first.</p>
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
