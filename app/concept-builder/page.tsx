"use client";

import { useMemo, useState } from "react";

export default function ConceptBuilderPage() {
  const [business, setBusiness] = useState("");
  const [niche, setNiche] = useState("local service business");
  const [city, setCity] = useState("");
  const [service, setService] = useState("");
  const [proof, setProof] = useState("");
  const [cta, setCta] = useState("Request a Free Estimate");

  const mockup = useMemo(() => {
    const name = business || "Your Business";
    const mainService = service || "your main service";
    const market = city ? ` in ${city}` : "";
    const trust = proof || "Local service • Clear communication • Trusted customer care";

    return {
      headline: `${mainService} Made Simple${market}`,
      subheadline: `${name} helps local customers get ${mainService.toLowerCase()} with a fast, straightforward path to the next step.`,
      cta,
      proof: trust,
      sections: [
        "Hero: main service + click-to-call + primary CTA",
        "Trust strip: reviews, years in business, license/warranty/guarantee where applicable",
        "Services: 3-6 highest-value services",
        "Why choose us: concise differentiators",
        "Service area: cities/areas served",
        "Reviews or before/after proof",
        "Short estimate/booking form",
        "Final click-to-call CTA"
      ]
    };
  }, [business, city, service, proof, cta]);

  const fullText = `Business: ${business || "Your Business"}
Niche: ${niche}
Market: ${city || "Local market"}
Main service: ${service || "Main service"}

Headline:
${mockup.headline}

Subheadline:
${mockup.subheadline}

Primary CTA:
${mockup.cta}

Trust proof:
${mockup.proof}

Recommended page structure:
${mockup.sections.map((item, index) => `${index + 1}. ${item}`).join("\n")}

Build goal:
Make it obvious on mobile what the business does, why the visitor should trust them, and how to call, request an estimate, or book without hunting through the site.`;

  async function copy() {
    await navigator.clipboard.writeText(fullText);
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Mockup Builder</div>
        <h1>Free Lead-Page Mockup Builder</h1>
        <p>Turn an interested prospect into a clear page plan before they pay.</p>
        <div className="actions">
          <a className="secondary" href="/deals">Deals</a>
          <a className="secondary" href="/fulfillment">Launch Workflow</a>
          <button className="primary button-reset" onClick={copy}>Copy Mockup Brief</button>
        </div>
      </section>

      <section className="card finder-card">
        <h2>Prospect Details</h2>
        <div className="finder-form">
          <label>Business Name<input value={business} onChange={(event) => setBusiness(event.target.value)} /></label>
          <label>Business Type<input value={niche} onChange={(event) => setNiche(event.target.value)} /></label>
          <label>City / Market<input value={city} onChange={(event) => setCity(event.target.value)} /></label>
          <label>Main Service<input value={service} onChange={(event) => setService(event.target.value)} /></label>
          <label>Trust Proof<input value={proof} onChange={(event) => setProof(event.target.value)} placeholder="4.9 stars, 20 years, licensed, warranty..." /></label>
          <label>Primary CTA<input value={cta} onChange={(event) => setCta(event.target.value)} /></label>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span>Headline</span><strong>{mockup.headline}</strong></div>
        <div className="card"><span>CTA</span><strong>{mockup.cta}</strong></div>
      </section>

      <section className="card">
        <h2>Mockup Structure</h2>
        <div className="item"><strong>{mockup.subheadline}</strong><p>{mockup.proof}</p></div>
        {mockup.sections.map((item, index) => <div className="item" key={item}><strong>{index + 1}. {item}</strong></div>)}
      </section>
    </main>
  );
}
