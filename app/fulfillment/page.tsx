"use client";

const intakeReply = `Thanks for sending the details. I have everything I need to start the promo concept. I will build it around your business, offer, and current online presence, then send back the concept, caption, hook, and call-to-action.`;
const deliveryMessage = `Here is your promo concept. It includes the hook, short video direction, caption, and call-to-action. If you like this direction, the next step would be the $99 growth pack or the $199 monthly content plan so we can keep content ideas moving consistently.`;

export default function FulfillmentPage() {
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Fulfillment</div>
        <h1>Paid Client Fulfillment</h1>
        <p>Use this after a business pays and sends their start details.</p>
        <div className="actions">
          <a className="secondary" href="/deals">Deals</a>
          <a className="secondary" href="/pay">Pay Page</a>
          <a className="secondary" href="/start">Start Page</a>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span>Step 1</span><strong>Confirm Payment</strong><p>Check Cash App for the matching payment before doing work.</p></div>
        <div className="card"><span>Step 2</span><strong>Collect Assets</strong><p>Use their website, social page, service, offer, and photos/videos.</p></div>
        <div className="card"><span>Step 3</span><strong>Create Concept</strong><p>Write a hook, short video direction, caption, and call-to-action.</p></div>
        <div className="card"><span>Step 4</span><strong>Upsell Monthly</strong><p>Offer the $99 pack or $199/month plan after delivery.</p></div>
      </section>

      <section className="board">
        <div className="card">
          <h2>Confirm Message</h2>
          <div className="item"><p>{intakeReply}</p><button className="primary button-reset small" onClick={() => copy(intakeReply)}>Copy</button></div>
        </div>
        <div className="card">
          <h2>Delivery Message</h2>
          <div className="item"><p>{deliveryMessage}</p><button className="primary button-reset small" onClick={() => copy(deliveryMessage)}>Copy</button></div>
        </div>
      </section>

      <section className="card">
        <h2>Sample Starter Output</h2>
        <div className="item"><strong>Hook</strong><p>A strong first line that makes someone stop scrolling.</p></div>
        <div className="item"><strong>Video Direction</strong><p>What the reel should show scene-by-scene using what the business already has.</p></div>
        <div className="item"><strong>Caption</strong><p>A short caption with a local angle and clear service benefit.</p></div>
        <div className="item"><strong>Call-To-Action</strong><p>Book now, message today, call for quote, claim offer, or visit the business.</p></div>
      </section>
    </main>
  );
}
