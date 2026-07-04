const samplePay = process.env.NEXT_PUBLIC_PAY_SAMPLE_URL || "";
const growthPay = process.env.NEXT_PUBLIC_PAY_GROWTH_URL || "";
const monthlyPay = process.env.NEXT_PUBLIC_PAY_MONTHLY_URL || "";

const packages = [
  { name: "Sample Starter", price: "$49", link: samplePay, detail: "One short promo concept, caption, and call-to-action." },
  { name: "Local Growth Pack", price: "$99", link: growthPay, detail: "Four short promo concepts with captions and posting direction." },
  { name: "Monthly Auto Content", price: "$199/mo", link: monthlyPay, detail: "Eight short promo concepts per month with captions and direction." }
];

export default function PayPage() {
  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">Gregory Crowell Creative</div>
        <h1>Secure Your Promo Package</h1>
        <p>Pick a package, pay, then send your business details so the promo content can be started.</p>
        <div className="actions">
          <a className="secondary" href="/business-package">View Packages</a>
          <a className="secondary" href="/start">Start Details</a>
        </div>
      </section>

      <section className="grid">
        {packages.map((item) => (
          <div className="card" key={item.name}>
            <span>{item.name}</span>
            <strong>{item.price}</strong>
            <p>{item.detail}</p>
            {item.link ? (
              <a className="primary small" href={item.link}>Pay {item.price}</a>
            ) : (
              <p>Payment link pending.</p>
            )}
          </div>
        ))}
      </section>

      <section className="card">
        <h2>After Payment</h2>
        <div className="item"><strong>Send your business details</strong><p>Business name, website/social link, package choice, and service or offer to promote.</p></div>
        <div className="item"><strong>Start small</strong><p>The $49 sample is the easiest first step before moving into monthly content.</p></div>
      </section>
    </main>
  );
}
