import { useEffect, useState } from "react";
import { getImages } from "../utils/getImages";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import RSVPForm from "./RSVPForm";

export default function Hero({ onRSVPClick }) {
  const [backgrounds, setBackgrounds] = useState([]);
  const [active, setActive] = useState(0);
  const [next, setNext] = useState(1);
  const [fade, setFade] = useState(false);
  const [nextLoaded, setNextLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [counts, setCounts] = useState({ playing: 0, watching: 0 });

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
    <section className="hero-container">
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

      <div className="hero-overlay">
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
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText("707 Fairview Ave, Glen Ellyn, IL 60137");
                const icon = document.querySelector(".copy-btn svg");
                icon.classList.add("copied");
                setTimeout(() => icon.classList.remove("copied"), 800);
              }}
              aria-label="Copy address"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </p>
          <p>9am Kickoff</p>
      </div>

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
