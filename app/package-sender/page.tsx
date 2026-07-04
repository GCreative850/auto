"use client";

const businessLink = "https://auto-azure.vercel.app/business-package";
const message = `Here is the simple package page with the $49 sample and monthly options: ${businessLink}`;

export default function PackageSenderPage() {
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Package Sender</div>
        <h1>Package Sender</h1>
        <p>Use this with Send Queue when a business needs the clean package link.</p>
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
