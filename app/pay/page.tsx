const launchPay = process.env.NEXT_PUBLIC_PAY_LAUNCH_URL || process.env.NEXT_PUBLIC_PAY_GROWTH_URL || "https://cash.app/$ZZZaccheus";
const monthlyPay = process.env.NEXT_PUBLIC_PAY_MONTHLY_URL || "https://cash.app/$ZZZaccheus";

const packages = [
  { name: "Lead Page Launch", price: "$450", link: launchPay, detail: "One conversion-focused mobile lead page with click-to-call, estimate form, service/review copy, basic SEO structure, and deployment." },
  { name: "Care Plan", price: "$99/mo", link: monthlyPay, detail: "Optional ongoing text, photo, offer, and service updates after launch." }
];

export default function PayPage() {
  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">GCCreative / AutoHQ AI</div>
        <h1>Launch Your Lead Page</h1>
        <p>Use this page after you approve the mockup. The standard launch is $450; ongoing upkeep is optional.</p>
        <div className="actions">
          <a className="secondary" href="/business-package">View Package</a>
          <a className="secondary" href="/start">Send Business Details</a>
        </div>
      </section>

      <section className="grid">
        {packages.map((item) => (
          <div className="card" key={item.name}>
            <span>{item.name}</span>
            <strong>{item.price}</strong>
            <p>{item.detail}</p>
            <a className="primary small" href={item.link}>Pay {item.price}</a>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>After Payment</h2>
        <div className="item"><strong>Send the final business details</strong><p>Business name, phone/email, services, service area, preferred CTA, logo/colors, and any reviews/photos you want featured.</p></div>
        <div className="item"><strong>Launch</strong><p>We finalize the approved concept and publish the finished page. The care plan is optional.</p></div>
      </section>
    </main>
  );
}
