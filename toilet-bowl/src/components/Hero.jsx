import { useEffect, useState } from "react";
import { getImages } from "../utils/getImages";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import RSVPForm from "./RSVPForm";

export default function Hero() {
  const [backgrounds, setBackgrounds] = useState([]);
  const [active, setActive] = useState(0);
  const [fade, setFade] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [counts, setCounts] = useState({ playing: 0, watching: 0 });

  // Preload all background images
  useEffect(() => {
    async function loadBackgrounds() {
      const urls = await getImages("backgrounds");
      const shuffled = urls.sort(() => Math.random() - 0.5);
      setBackgrounds(shuffled);

      // Preload
      shuffled.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }
    loadBackgrounds();
  }, []);

  // Cycle every 5s with preloaded fade
  useEffect(() => {
    if (backgrounds.length === 0) return;

    const interval = setInterval(() => {
      setFade(true);

      setTimeout(() => {
        setActive((prev) => (prev + 1) % backgrounds.length);
        setFade(false);
      }, 1200); // matches CSS transition
    }, 5000);

    return () => clearInterval(interval);
  }, [backgrounds]);

  // Attendance listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "rsvps"), (snapshot) => {
      let playing = 0;
      let watching = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status === "playing") playing++;
        if (data.status === "watching") watching++;
      });
      setCounts({ playing, watching });
    });
    return () => unsub();
  }, []);

  const nextIndex = (active + 1) % backgrounds.length;

  return (
    <section className="hero-container">
      {/* Base image */}
      <div
        className="hero-bg"
        style={{
          backgroundImage: `url(${backgrounds[active] || ""})`,
        }}
      />

      {/* Next image that fades in */}
      <div
        className={`hero-bg fade-layer ${fade ? "visible" : ""}`}
        style={{
          backgroundImage: `url(${backgrounds[nextIndex] || ""})`,
        }}
      />

      <div className="hero-overlay">
        <h1>Toilet Bowl 2025</h1>
        <button onClick={() => setShowForm(true)}>RSVP Now</button>
        {showForm && <RSVPForm onClose={() => setShowForm(false)} />}

        <div className="attendance-summary">
          <p>
            <strong>{counts.playing}</strong> Playing •{" "}
            <strong>{counts.watching}</strong> Watching
          </p>
        </div>
      </div>
    </section>
  );
}
