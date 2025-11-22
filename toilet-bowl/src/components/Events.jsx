// src/components/Events.jsx
import { useEffect, useState } from "react";
import { db, collection, getDocs } from "../firebase";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(collection(db, "events"));
        const data = snap.docs.map((d) => d.data());
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(data);
      } catch (e) {
        console.error("Failed to fetch events:", e);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <section id="events" className="events">
      <h2>Toilet Bowl Events</h2>
      <p className="subtitle">Practice makes perfect — and don’t miss dinner the night before kickoff!</p>

      <div className="event-list">
        {events.map((ev, i) => (
          <div className={`event-card ${ev.type}`} key={i}>
            <div className="event-date">{formatDate(ev.date)}</div>

            <div className="event-body">
              <h3>{ev.title}</h3>
              <p className="event-location">{ev.location}</p>
              <p className="event-details">{ev.details}</p>

              {ev.address && (
                <a
                  className="event-address"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ev.address}
                </a>
              )}
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
