"use client";

const presets = [
  ["Auto Detailing", "Pensacola", "FL"],
  ["Pressure Washing", "Gulf Breeze", "FL"],
  ["Med Spa", "Navarre", "FL"],
  ["Roofing", "Milton", "FL"],
  ["Barbershop", "Pace", "FL"],
  ["Hair Salon", "Fort Walton Beach", "FL"],
  ["Landscaping", "Destin", "FL"],
  ["HVAC", "Panama City Beach", "FL"],
  ["Dentist", "Pensacola", "FL"],
  ["Restaurant", "Mobile", "AL"]
];

export default function BroadPage() {
  function openPreset(niche: string, city: string, state: string) {
    const params = new URLSearchParams({ niche, city, state });
    window.location.href = `/automation?${params.toString()}`;
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Broad Markets</div>
        <h1>Broad Market Runner</h1>
        <p>Pick a high-demand local market, then run Automation for that niche and city.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/automation">Automation</a>
          <a className="secondary" href="/status">Status</a>
        </div>
      </section>

      <section className="grid">
        {presets.map(([niche, city, state]) => (
          <button className="card button-reset" key={`${niche}-${city}`} onClick={() => openPreset(niche, city, state)}>
            <span>{city}, {state}</span>
            <strong>{niche}</strong>
            <p>Open this market in Automation.</p>
          </button>
        ))}
      </section>
    </main>
  );
}
