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
  const [counts, setCounts] = useState({ playing: 0, watching: 0 });

  useEffect(() => {
    async function loadBackgrounds() {
      const urls = await getImages("backgrounds");

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

  useEffect(() => {
    if (backgrounds.length === 0) return;

    const img = new Image();
    img.src = backgrounds[(active + 1) % backgrounds.length];
    img.onload = () => setNextLoaded(true);
    img.onerror = () => setNextLoaded(true);
  }, [active, backgrounds]);

  useEffect(() => {
    if (backgrounds.length === 0 || !nextLoaded) return;

    const interval = setInterval(() => {
      setFade(true);

      setTimeout(() => {
        setActive((prev) => (prev + 1) % backgrounds.length);
        setNextLoaded(false);
        setFade(false);
      }, 1200);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgrounds, nextLoaded]);

  useEffect(() => {
    setNext((active + 1) % backgrounds.length);
  }, [active, backgrounds]);

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
          <h1>Toilet Bowl 2026</h1>
          <p>Loading the action...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-container" id="rsvp">
      <div
        className="hero-bg"
        style={{
          backgroundImage: `url(${backgrounds[active]})`,
        }}
      />

      {nextLoaded && (
        <div
          className={`hero-bg fade-layer ${fade ? "visible" : ""}`}
          style={{
            backgroundImage: `url(${backgrounds[next]})`,
          }}
        />
      )}

      <div className="hero-overlay">
        <div className="hero-title">
          <h1>Toilet Bowl 2026</h1>
          <button className="rsvp-btn" onClick={onRSVPClick}>RSVP Now</button>
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
          <p>Thanksgiving Day - Thursday, November 26, 2026</p>
        </div>

        <button
          className="attendance-summary"
          onClick={() => document.getElementById("attendance")?.scrollIntoView({ behavior: "smooth" })}
        >
          <p>
            <strong>{counts.playing}</strong> Playing |{" "}
            <strong>{counts.watching}</strong> Watching
          </p>
        </button>
      </div>
    </section>
  );
}
