"use client";

const firstUpsell = `I’m glad you liked the sample direction. The next step would be the $99 Local Growth Pack, where I create 4 more short promo concepts and captions around your services so you have more content to post.`;
const monthlyUpsell = `If you want this handled consistently, the monthly option is $199/month for 8 short promo concepts with captions and direction. That keeps your business from having to constantly figure out what to post.`;
const softClose = `Want me to continue with the $99 pack, or would the $199/month plan make more sense so you have ongoing content ideas each month?`;

export default function UpsellPage() {
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Upsell</div>
        <h1>Turn $49 Samples Into Monthly Clients</h1>
        <p>Use this after you deliver the sample concept.</p>
        <div className="actions">
          <a className="secondary" href="/fulfillment">Fulfillment</a>
          <a className="secondary" href="/pay">Pay Page</a>
          <a className="secondary" href="/deals">Deals</a>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span>Step 1</span><strong>Deliver Sample</strong><p>Send the hook, direction, caption, and CTA.</p></div>
        <div className="card"><span>Step 2</span><strong>Offer $99 Pack</strong><p>Four more promo concepts for the next content batch.</p></div>
        <div className="card"><span>Step 3</span><strong>Offer $199/mo</strong><p>Eight concepts per month for ongoing consistency.</p></div>
      </section>

      <section className="board">
        <div className="card"><h2>$99 Upsell</h2><div className="item"><p>{firstUpsell}</p><button className="primary button-reset small" onClick={() => copy(firstUpsell)}>Copy</button></div></div>
        <div className="card"><h2>Monthly Upsell</h2><div className="item"><p>{monthlyUpsell}</p><button className="primary button-reset small" onClick={() => copy(monthlyUpsell)}>Copy</button></div></div>
      </section>

      <section className="card">
        <h2>Soft Close</h2>
        <div className="item"><p>{softClose}</p><button className="primary button-reset small" onClick={() => copy(softClose)}>Copy Close</button></div>
      </section>
    </main>
  );
}
