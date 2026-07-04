"use client";

const offers = [
  {
    name: "Today Intro Reel",
    price: "$49",
    detail: "One short promo reel concept using their current website, services, photos, or public social content."
  },
  {
    name: "Starter Content Pack",
    price: "$99",
    detail: "Four short promo post ideas/reels for one service, offer, event, or local special."
  },
  {
    name: "Monthly Local Content",
    price: "$199",
    detail: "Eight short content pieces per month plus caption ideas and simple posting plan."
  }
];

const closeScript = `I can start with a simple $49 intro reel so there is no big commitment. If you like it, we can move into a small monthly plan where I keep content ideas going for your business. Want me to send the payment link and start with your website/photos?`;
const outreachScript = `Hey, I help local businesses turn their current services, photos, and offers into short promo reels for TikTok, Instagram, Facebook, and YouTube Shorts. I am doing a $49 intro reel today for local businesses. Want me to make one quick concept for your business?`;

export default function MoneyModePage() {
  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Money Mode</div>
        <h1>Today&apos;s Offer</h1>
        <p>Use this page to turn AutoHQ leads into paid intro work today.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
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
        <h2>Today&apos;s Target</h2>
        <div className="item"><strong>Send 30 approved drafts</strong><p>Use Broad Markets, Automation, then Send Queue.</p></div>
        <div className="item"><strong>Get 3 interested replies</strong><p>Move them into Deals and use the $49 intro close.</p></div>
        <div className="item"><strong>Close 1 paid intro</strong><p>Start with one simple reel concept, then upsell monthly.</p></div>
      </section>
    </main>
  );
}
