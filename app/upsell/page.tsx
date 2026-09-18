"use client";

const carePlan = `Your page is live. If you want me to keep it updated, the optional care plan is $99/month. That covers small text changes, service/offer updates, photo swaps, contact-info changes, and routine landing-page maintenance. You can also skip the plan and keep the launched page as-is.`;
const updateRequest = `Send the exact change you want, the new text/photo/offer if applicable, and the page section it belongs in. I’ll confirm the update before publishing anything that changes pricing, claims, or business details.`;
const softClose = `Would you like the optional $99/month care plan, or do you want to keep the page as a one-time launch for now?`;

export default function UpsellPage() {
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Care Plan</div>
        <h1>Optional $99/Month Maintenance</h1>
        <p>Offer this only after the $450 lead page is launched and approved.</p>
        <div className="actions">
          <a className="secondary" href="/fulfillment">Launch Workflow</a>
          <a className="secondary" href="/pay">Payment Page</a>
          <a className="secondary" href="/deals">Deals</a>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span>Included</span><strong>Small Edits</strong><p>Text, photos, contact details, offers, service updates, and similar maintenance.</p></div>
        <div className="card"><span>Not Included</span><strong>Major Rebuilds</strong><p>Large redesigns, custom applications, ad management, or new multi-page projects are quoted separately.</p></div>
        <div className="card"><span>Control</span><strong>Optional</strong><p>The client can keep the launched page without subscribing.</p></div>
      </section>

      <section className="board">
        <div className="card"><h2>Care Plan Offer</h2><div className="item"><p>{carePlan}</p><button className="primary button-reset small" onClick={() => copy(carePlan)}>Copy</button></div></div>
        <div className="card"><h2>Update Request</h2><div className="item"><p>{updateRequest}</p><button className="primary button-reset small" onClick={() => copy(updateRequest)}>Copy</button></div></div>
      </section>

      <section className="card">
        <h2>Soft Close</h2>
        <div className="item"><p>{softClose}</p><button className="primary button-reset small" onClick={() => copy(softClose)}>Copy Close</button></div>
      </section>
    </main>
  );
}
