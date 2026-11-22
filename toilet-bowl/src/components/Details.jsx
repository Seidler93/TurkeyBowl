import useGameYear from "../utils/useGameYear";
import { gameDateLabel } from "../utils/gameYear";

export default function Details() {
  const year = useGameYear();
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
          <li><strong>Date:</strong> Thanksgiving Day - {gameDateLabel(year)}</li>
          <li><strong>Kickoff time:</strong> Kickoff at 9:00 AM. Plan to arrive around 8:30-8:45 AM to warm up and pick teams.</li>
          <li><strong>Weather:</strong> The game is ON no matter the weather conditions! Pop-up canopies, chairs, and blankets will be provided for viewers.</li>
          <li><strong>Gear:</strong> Cleats and gloves suggested for better traction and grip.</li>
          <li><strong>Seating:</strong> Chairs and some benches will be available. You're welcome to bring your own folding chair, too.</li>
          <li><strong>Hydration:</strong> Water and Gatorade will be provided.</li>
        </ul>
      </div>
    </section>
  );
}
