import { useEffect, useState } from "react";
import { getImages } from "../utils/getImages";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import useGameYear from "../utils/useGameYear";
import { gameDateLabel } from "../utils/gameYear";

export default function Hero({ onRSVPClick }) {
  const year = useGameYear();
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
    const unsub = onSnapshot(query(collection(db, "rsvps"), where("year", "==", year)), (snapshot) => {
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
  }, [year]);

  if (backgrounds.length === 0) {
    return (
      <section className="hero">
        <div className="overlay">
          <h1>Toilet Bowl {year}</h1>
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
          <h1>Toilet Bowl {year}</h1>
          <button className="rsvp-btn" onClick={onRSVPClick}>RSVP for {year}</button>
          <dl className="hero-info">
            <div className="hero-info-row">
              <dt>When</dt>
              <dd>{gameDateLabel(year)}<span>Thanksgiving Day</span></dd>
            </div>
            <div className="hero-info-row">
              <dt>Kickoff</dt>
              <dd>9:00 AM<span>Arrive at 8:30 AM to warm up</span></dd>
            </div>
            <div className="hero-info-row">
              <dt>Where</dt>
              <dd><a
              href="https://www.google.com/maps/search/?api=1&query=707+Fairview+Ave,+Glen+Ellyn,+IL+60137"
              target="_blank"
              rel="noopener noreferrer"
            >
              Newton Park
              <span>707 Fairview Ave</span>
              <span>Glen Ellyn, IL 60137</span>
            </a>
              </dd>
            </div>
          </dl>
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
