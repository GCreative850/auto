"use client";

const businessLink = "https://auto-azure.vercel.app/business-package";
const message = `Here is the simple lead-page package: I can mock up the concept first at no obligation. If you want it launched, the full setup is $450 with optional $99/month upkeep: ${businessLink}`;

export default function PackageSenderPage() {
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Package Sender</div>
        <h1>Package Sender</h1>
        <p>Use this when an interested business wants the offer and pricing in one clean page.</p>
        <div className="actions">
          <a className="secondary" href="/send-queue">Send Queue</a>
          <a className="secondary" href="/business-package">View Client Page</a>
          <a className="secondary" href="/deals">Deals</a>
        </div>
      </section>

      <section className="card">
        <h2>Business Package Link</h2>
        <div className="item">
          <strong>{businessLink}</strong>
          <button className="primary button-reset small" onClick={() => copy(businessLink)}>Copy Link</button>
        </div>
      </section>

      <section className="card">
        <h2>Send This Line</h2>
        <div className="item">
          <p>{message}</p>
          <button className="primary button-reset small" onClick={() => copy(message)}>Copy Message</button>
        </div>
      </section>
    </main>
  );
}
