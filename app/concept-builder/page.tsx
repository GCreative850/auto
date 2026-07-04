"use client";

import { useMemo, useState } from "react";

export default function ConceptBuilderPage() {
  const [business, setBusiness] = useState("");
  const [niche, setNiche] = useState("local service business");
  const [city, setCity] = useState("Pensacola");
  const [offer, setOffer] = useState("");

  const concept = useMemo(() => {
    const name = business || "Your business";
    const service = offer || "your main service";
    const local = city || "your area";
    return {
      hook: `${local}, if you need ${service}, ${name} makes it simple.`,
      direction: `Scene 1: Show the service or result right away. Scene 2: Show the problem customers have before booking. Scene 3: Show ${name} as the simple local solution. Scene 4: Show proof, finished work, happy customer, clean space, or before-and-after. Scene 5: End with the offer and how to contact the business.`,
      caption: `${name} helps customers in ${local} with ${service}. Message today to ask a question, book, or get started.`,
      cta: `Message ${name} today to get started.`
    };
  }, [business, city, offer]);

  const fullText = `Business: ${business || "Your business"}\nNiche: ${niche}\nCity: ${city}\nOffer: ${offer || "Main service"}\n\nHook:\n${concept.hook}\n\nVideo Direction:\n${concept.direction}\n\nCaption:\n${concept.caption}\n\nCall-To-Action:\n${concept.cta}`;

  async function copy() {
    await navigator.clipboard.writeText(fullText);
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="kicker">AutoHQ Concept Builder</div>
        <h1>$49 Promo Concept Builder</h1>
        <p>Turn paid client details into a ready-to-send promo concept.</p>
        <div className="actions">
          <a className="secondary" href="/fulfillment">Fulfillment</a>
          <a className="secondary" href="/command-center">Command Center</a>
          <button className="primary button-reset" onClick={copy}>Copy Concept</button>
        </div>
      </section>

      <section className="card finder-card">
        <h2>Client Details</h2>
        <div className="finder-form">
          <label>Business Name<input value={business} onChange={(event) => setBusiness(event.target.value)} /></label>
          <label>Business Type<input value={niche} onChange={(event) => setNiche(event.target.value)} /></label>
          <label>City<input value={city} onChange={(event) => setCity(event.target.value)} /></label>
          <label>Service or Offer<input value={offer} onChange={(event) => setOffer(event.target.value)} /></label>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span>Hook</span><strong>{concept.hook}</strong></div>
        <div className="card"><span>CTA</span><strong>{concept.cta}</strong></div>
      </section>

      <section className="card">
        <h2>Ready Concept</h2>
        <div className="item"><strong>Video Direction</strong><p>{concept.direction}</p></div>
        <div className="item"><strong>Caption</strong><p>{concept.caption}</p></div>
      </section>
    </main>
  );
}
