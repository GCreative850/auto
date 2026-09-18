"use client";

const intakeReply = `Thanks — I have the details I need to finalize the lead page. I’ll keep the approved mockup direction, confirm the call/estimate/booking flow, and use the business details you sent for the final version.`;
const deliveryMessage = `Your lead page is live. Please check the phone number, contact/estimate flow, services, service area, and any review/photo details. If everything looks right, this version is ready to use. Ongoing edits are optional at $99/month; there is no requirement to keep the care plan.`;

export default function FulfillmentPage() {
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Launch Workflow</div>
        <h1>Paid Client Fulfillment</h1>
        <p>Use this after the prospect approves the mockup and pays the $450 launch fee.</p>
        <div className="actions">
          <a className="secondary" href="/deals">Deals</a>
          <a className="secondary" href="/concept-builder">Mockup Builder</a>
          <a className="secondary" href="/start">Client Details</a>
          <a className="secondary" href="/upsell">Care Plan</a>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span>Step 1</span><strong>Confirm Payment</strong><p>Verify the $450 launch payment before final production work.</p></div>
        <div className="card"><span>Step 2</span><strong>Lock Details</strong><p>Phone, email, services, service area, CTA, branding, reviews, and images.</p></div>
        <div className="card"><span>Step 3</span><strong>Build + Verify</strong><p>Finalize the approved page, deploy it, and test mobile layout, links, and forms.</p></div>
        <div className="card"><span>Step 4</span><strong>Hand Off</strong><p>Send the live link and give the client a short verification checklist.</p></div>
      </section>

      <section className="board">
        <div className="card">
          <h2>Payment + Intake Confirmation</h2>
          <div className="item"><p>{intakeReply}</p><button className="primary button-reset small" onClick={() => copy(intakeReply)}>Copy</button></div>
        </div>
        <div className="card">
          <h2>Launch Message</h2>
          <div className="item"><p>{deliveryMessage}</p><button className="primary button-reset small" onClick={() => copy(deliveryMessage)}>Copy</button></div>
        </div>
      </section>

      <section className="card">
        <h2>Pre-Launch Checklist</h2>
        <div className="item"><strong>Contact actions</strong><p>Call, email, estimate/booking form, and any text links use the correct information.</p></div>
        <div className="item"><strong>Mobile first</strong><p>Headline, CTA, form, reviews, and service proof are easy to use on a phone.</p></div>
        <div className="item"><strong>Truthful copy</strong><p>Do not publish claims, reviews, guarantees, license details, or service areas that cannot be verified.</p></div>
        <div className="item"><strong>Final approval</strong><p>Client confirms the live content before any optional ongoing maintenance begins.</p></div>
      </section>
    </main>
  );
}
