// src/components/Events.jsx
import { useEffect, useState } from "react";
import { db, collection, getDocs } from "../firebase";
import useGameYear from "../utils/useGameYear";
import { eventDate } from "../utils/eventDate";

export default function Events() {
  const year = useGameYear();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(collection(db, "events"));
        const data = snap.docs.filter((d) => d.data().type === "dinner").map((d) => {
          const event = d.data();
          return { ...event, date: eventDate(event, year) };
        });
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(data);
      } catch (e) {
        console.error("Failed to fetch events:", e);
      }
    };
    fetchEvents();
  }, [year]);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      timeZone: "America/Chicago",
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <section id="events" className="details">
      <h2>Pregame Dinner</h2>

        {events.map((ev, i) => (
          <div className="details-card" key={i}>
            <ul className="details-list">
              <li><strong>Location:</strong> {ev.location}</li>
              {ev.address && (
                <li><strong>Address:</strong>{" "}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ev.address}
                </a>
                </li>
              )}
              <li><strong>Date:</strong> {formatDate(ev.date)}</li>
              <li><strong>Start time:</strong> {formatTime(ev.date)}</li>
              {ev.details && <li><strong>Details:</strong> {ev.details}</li>}
              <li><strong>Contact:</strong> AJ - <a href="tel:+12246605288">224-660-5288</a></li>
            </ul>
            <img
              className="dinner-photo"
              src="/pregame-dinner.jpg"
              alt="A slice of deep-dish pizza lifted from the pie with melted cheese stretching underneath"
              width="678"
              height="452"
              loading="lazy"
            />
          </div>
        ))}

    </section>
  );
}
