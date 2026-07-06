export default function Details() {
  return (
    <section id="details" className="details">
      <h2>Event Details</h2>

      <div className="details-card">
        <ul className="details-list">
          <li><strong>Location:</strong> <a
            href="https://www.google.com/maps/search/?api=1&query=707+Fairview+Ave,+Glen+Ellyn,+IL+60137"
            target="_blank"
            rel="noopener noreferrer"
          >
            707 Fairview Ave, Glen Ellyn, IL 60137
          </a></li>
          <li><strong>Date:</strong> Thanksgiving Day - Thursday, November 26, 2026</li>
          <li><strong>Kickoff time:</strong> Kickoff at 9:00 AM. Plan to arrive around 8:30-8:45 AM to warm up and pick teams.</li>
          <li><strong>Gear:</strong> Cleats and gloves suggested for better traction and grip.</li>
          <li><strong>Seating:</strong> Some benches available, bring a folding chair if you'd like your own spot.</li>
          <li><strong>Hydration:</strong> Water and Gatorade will be provided.</li>
        </ul>
      </div>
    </section>
  );
}
