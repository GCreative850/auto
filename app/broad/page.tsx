"use client";

const presets = [
  ["Roofing", "Phoenix", "AZ"],
  ["Roofing", "Houston", "TX"],
  ["HVAC", "Dallas", "TX"],
  ["Plumbing", "San Antonio", "TX"],
  ["Pressure Washing", "Tampa", "FL"],
  ["Tree Service", "Atlanta", "GA"],
  ["Roofing", "Charlotte", "NC"],
  ["HVAC", "Nashville", "TN"],
  ["Landscaping", "Denver", "CO"],
  ["Electrician", "Las Vegas", "NV"],
  ["Med Spa", "Scottsdale", "AZ"],
  ["Dentist", "Orlando", "FL"],
  ["Roofing", "Columbus", "OH"],
  ["HVAC", "Indianapolis", "IN"],
  ["Plumbing", "Kansas City", "MO"],
  ["Pressure Washing", "Jacksonville", "FL"],
  ["Tree Service", "Raleigh", "NC"],
  ["Roofing", "Oklahoma City", "OK"],
  ["HVAC", "Richmond", "VA"],
  ["Landscaping", "Salt Lake City", "UT"]
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
        <h1>Nationwide Market Runner</h1>
        <p>Rotate through high-value quote-driven businesses across multiple U.S. markets instead of relying on one niche or one state.</p>
        <div className="actions">
          <a className="secondary" href="/">Dashboard</a>
          <a className="secondary" href="/automation">Automation</a>
          <a className="secondary" href="/money-mode">Money Mode</a>
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
