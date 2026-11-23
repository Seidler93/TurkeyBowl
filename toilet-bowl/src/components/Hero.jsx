import { useEffect, useState } from "react";
import { getImages, getImageUrl } from "../utils/getImages";
import { getRandomGalleryIndex } from "../utils/getGalleryIndex";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import useGameYear from "../utils/useGameYear";
import { gameDateLabel } from "../utils/gameYear";

function preloadPhoto(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  });
}

export default function Hero({ onRSVPClick }) {
  const year = useGameYear();
  const [backgrounds, setBackgrounds] = useState([]);
  const [active, setActive] = useState(0);
  const [next, setNext] = useState(1);
  const [fade, setFade] = useState(false);
  const [nextLoaded, setNextLoaded] = useState(false);
  const [firstReady, setFirstReady] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadBackgrounds() {
      const [existing, photos] = await Promise.all([
        getImages("backgrounds"),
        getRandomGalleryIndex(),
      ]);
      const galleryUrls = await Promise.all(photos.slice(0, 12).map(async (photo) => {
        if (photo.fullPath) {
          try { return await getImageUrl(photo.fullPath); }
          catch { return photo.fullUrl || photo.thumbUrl; }
        }
        return photo.fullUrl || photo.thumbUrl;
      }));
      const urls = [...new Set([...existing, ...galleryUrls].filter(Boolean))];
      for (let index = urls.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [urls[index], urls[other]] = [urls[other], urls[index]];
      }
      if (!cancelled) setBackgrounds(urls);
    }

    loadBackgrounds();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!backgrounds.length) return;
    let cancelled = false;
    async function loadFirst() {
      for (let index = 0; index < backgrounds.length; index++) {
        const loaded = await preloadPhoto(backgrounds[index]);
        if (cancelled) return;
        if (loaded) {
          setActive(index);
          setFirstReady(true);
          return;
        }
      }
    }
    loadFirst();
    return () => { cancelled = true; };
  }, [backgrounds]);

  useEffect(() => {
    if (!firstReady || backgrounds.length < 2) return;
    let cancelled = false;
    setNextLoaded(false);
    async function loadNext() {
      for (let step = 1; step < backgrounds.length; step++) {
        const index = (active + step) % backgrounds.length;
        const loaded = await preloadPhoto(backgrounds[index]);
        if (cancelled) return;
        if (loaded) {
          setNext(index);
          setNextLoaded(true);
          return;
        }
      }
    }
    loadNext();
    return () => { cancelled = true; };
  }, [active, backgrounds, firstReady]);

  useEffect(() => {
    if (!firstReady || !nextLoaded) return;
    let swapTimer;
    const fadeTimer = setTimeout(() => {
      setFade(true);
      swapTimer = setTimeout(() => {
        setActive(next);
        setNextLoaded(false);
        setFade(false);
      }, 1200);
    }, 5000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(swapTimer);
    };
  }, [firstReady, nextLoaded, next]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "rsvps"), where("year", "==", year)), (snapshot) => {
      let playing = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status === "playing") playing++;
      });
      setPlayerCount(playing);
    });
    return () => unsub();
  }, [year]);

  return (
    <section className="hero-container" id="rsvp">
      <div
        className={`hero-bg${firstReady ? " is-ready" : ""}`}
        aria-hidden="true"
        style={{
          backgroundImage: firstReady ? `url(${backgrounds[active]})` : undefined,
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
            <strong>{playerCount}</strong> Playing
          </p>
        </button>
      </div>
    </section>
  );
}
