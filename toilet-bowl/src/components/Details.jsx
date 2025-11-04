// src/components/Details.jsx
import { useState } from "react";

export default function Details() {
  const [copied, setCopied] = useState(false);

  const address = "707 Fairview Ave, Glen Ellyn, IL 60137";
  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section id="details" className="details">
      <h2>Event Details</h2>

      <div className="details-card">
        <ul className="details-list">
          <li>🎤 <strong>Location:</strong> <a
            href="https://www.google.com/maps/search/?api=1&query=707+Fairview+Ave,+Glen+Ellyn,+IL+60137"
            target="_blank"
            rel="noopener noreferrer"
          >
            707 Fairview Ave, Glen Ellyn, IL 60137
          </a></li>
          <li>📅 <strong>Date:</strong> Thanksgiving Day - Nov 27th, 2025</li>
          <li> <strong>Kickoff time:</strong> Kickoff at 9:00 AM. Plan to arrive early to warm up and pick teams.</li>
          <li>👟 <strong>Gear:</strong> Cleats and gloves suggested for better traction and grip.</li>
          <li>🪑 <strong>Seating:</strong> Some benches available, bring a folding chair if you’d like your own spot.</li>
          <li>💧 <strong>Hydration:</strong> Water and Gatorade will be provided on site.</li>
        </ul>
      </div>
    </section>
  );
}
