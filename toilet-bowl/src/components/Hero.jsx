import { useEffect, useState } from "react";
import { getImages } from "../utils/getImages";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Hero({ onRSVPClick }) {
  const [backgrounds, setBackgrounds] = useState([]);
  const [active, setActive] = useState(0);
  const [next, setNext] = useState(1);
  const [fade, setFade] = useState(false);
  const [nextLoaded, setNextLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [counts, setCounts] = useState({ playing: 0, watching: 0 });

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  // Load and preload all images once
  useEffect(() => {
    async function loadBackgrounds() {
      const urls = await getImages("backgrounds");

      // preload all
      await Promise.all(
        urls.map(
          (url) =>
            new Promise((resolve) => {
              const img = new Image();
              img.src = url;
              img.onload = resolve;
              img.onerror = resolve;
            })
        )
      );

      setBackgrounds(urls);
    }

    loadBackgrounds();
  }, []);

  // preload next image dynamically before fade
  useEffect(() => {
    if (backgrounds.length === 0) return;

    const preloadNext = (index) => {
      const img = new Image();
      img.src = backgrounds[index];
      img.onload = () => setNextLoaded(true);
      img.onerror = () => setNextLoaded(true);
    };

    preloadNext((active + 1) % backgrounds.length);
  }, [active, backgrounds]);

  // cycle images once next image is loaded
  useEffect(() => {
    if (backgrounds.length === 0 || !nextLoaded) return;

    const interval = setInterval(() => {
      setFade(true);

      // wait for fade-in to complete
      setTimeout(() => {
        setActive((prev) => (prev + 1) % backgrounds.length);
        setNextLoaded(false); // reset for next preload
        setFade(false);
      }, 1200);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgrounds, nextLoaded]);

  // track next index separately
  useEffect(() => {
    setNext((active + 1) % backgrounds.length);
  }, [active, backgrounds]);

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

  if (backgrounds.length === 0) {
    return (
      <section className="hero">
        <div className="overlay">
          <h1>Toilet Bowl 2025</h1>
          <p>Loading the action...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-container" id="rsvp">
      {/* Base image */}
      <div
        className="hero-bg"
        style={{
          backgroundImage: `url(${backgrounds[active]})`,
        }}
      />

      {/* Fade layer only shows once image is fully preloaded */}
      {nextLoaded && (
        <div
          className={`hero-bg fade-layer ${fade ? "visible" : ""}`}
          style={{
            backgroundImage: `url(${backgrounds[next]})`,
          }}
        />
      )}

      <div className="hero-overlay" >
        <div className="hero-title">
          <h1>Toilet Bowl 2025</h1>
            <button className="rsvp-btn" onClick={onRSVPClick}>RSVP Now</button>
          {/* {showForm && <RSVPForm onClose={() => setShowForm(false)} />} */}
            <p>Newton Park</p>
            <p className="address">
              <a
                href="https://www.google.com/maps/search/?api=1&query=707+Fairview+Ave,+Glen+Ellyn,+IL+60137"
                target="_blank"
                rel="noopener noreferrer"
              >
                707 Fairview Ave, Glen Ellyn, IL 60137
              </a>
              <button
                className="location-btn"
                onClick={() => {
                  window.open(
                    "https://www.google.com/maps/search/?api=1&query=707+Fairview+Ave,+Glen+Ellyn,+IL+60137",
                    "_blank"
                  );
                }}
                aria-label="Open location in Google Maps"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </button>

            </p>
            <p>9am Kickoff</p>
            <p>Thanksgiving Day - Nov 27th, 2025</p>
        </div>

        <div className="attendance-summary" onClick={() => scrollTo("attendance")}>
          <p>
            <strong>{counts.playing}</strong> Playing •{" "}
            <strong>{counts.watching}</strong> Watching
          </p>
        </div>
      </div>
    </section>
  );
}
