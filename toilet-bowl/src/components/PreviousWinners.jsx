import { useEffect, useMemo, useRef, useState } from "react";
import { db, collection, getDocs } from "../firebase";
import { storage } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";
import ZoomablePhoto from "./ZoomablePhoto";
import RosterDialog from "./RosterDialog";
import usePreloadPhotos from "../utils/usePreloadPhotos";

export default function PreviousWinners({ latestOnly = false, showHeading = true, onViewAll, view = "table" }) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rosterYear, setRosterYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const viewerRef = useRef(null);
  const touchStart = useRef(null);
  const photos = useMemo(() => rows.filter((row) => row.photoUrl), [rows]);
  const selectedIndex = selected ? photos.findIndex((row) => row.year === selected.year) : -1;
  usePreloadPhotos(photos, selectedIndex);

  const movePhoto = (direction) => {
    if (photos.length < 2) return;
    setSelected(photos[(selectedIndex + direction + photos.length) % photos.length]);
  };

  useEffect(() => {
    if (!selected) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    viewerRef.current?.querySelector("button")?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const available = rows.filter((row) => row.photoUrl);
        const index = available.findIndex((row) => row.year === selected.year);
        const direction = event.key === "ArrowLeft" ? -1 : 1;
        if (available.length > 1) setSelected(available[(index + direction + available.length) % available.length]);
      }
      if (event.key === "Tab") {
        const buttons = viewerRef.current?.querySelectorAll("button");
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [selected, rows]);

  useEffect(() => {
    let cancelled = false;
    const fetchWinners = async () => {
      setLoading(true);
      setError("");
      setSelected(null);
      try {
        const snap = await getDocs(collection(db, "years"));
        const data = await Promise.all(
          snap.docs
            .map((d) => d.data())
            .sort((a, b) => b.year - a.year)
            .slice(0, latestOnly ? 1 : undefined)
            .map(async (w) => {
              let photoUrl = w.photoUrl || "";
              if (w.photoPath) {
                try {
                  photoUrl = await getDownloadURL(ref(storage, w.photoPath));
                } catch (e) {
                  console.warn("Missing photo for", w.year, e);
                }
              }
              return { ...w, photoUrl };
            })
        );
        if (!cancelled) setRows(data);
      } catch (e) {
        console.error("Failed to load winners:", e);
        if (!cancelled) setError("Could not load the results. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchWinners();
    return () => { cancelled = true; };
  }, [latestOnly]);

  return (
    <section id="winners" className={latestOnly ? "details" : "winners"}>
      {showHeading && <h2>{latestOnly ? "Latest Winners" : "The Record Book"}</h2>}
      {loading && <p role="status">Loading results...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="subtitle">No results have been posted yet.</p>
      )}

      {!loading && !error && (latestOnly || view === "gallery") && rows.length > 0 && (
        <div className={latestOnly ? undefined : "record-gallery"}>
        {rows.map((row) => (
        <figure key={row.year} className={`champion-feature${row.photoUrl ? "" : " champion-feature-no-photo"}`}>
          {row.photoUrl ? (
            <button className="latest-winner-photo" onClick={() => setSelected(row)} aria-label={`View ${row.year} ${row.team} team photo`}>
              <img src={row.photoUrl} alt={`${row.year} ${row.team} winning team`} loading="lazy" />
            </button>
          ) : null}
          <figcaption className="champion-overlay">
            <div>
              <p className="champion-year">{row.year} Champions</p>
              <h3>{row.team}</h3>
            </div>
            <div className="champion-score">
              <span>Final Score</span>
              <strong>{row.score}</strong>
            </div>
          </figcaption>
          {!row.photoUrl && <p className="subtitle">Team photo coming soon.</p>}
        </figure>
        ))}
        </div>
      )}

      {!loading && !error && !latestOnly && view === "table" && rows.length > 0 && (
      <div className="winners-table-wrap">
        <table className="winners-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Team Photo</th>
              <th>Winning Team</th>
              <th>Score</th>
              <th>Roster</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year}>
                <td>
                  {r.photoUrl ? <button
                    className="year-link"
                    onClick={() =>
                      setSelected(r)
                    }
                    title="View group photo"
                  >
                    {r.year}
                  </button> : r.year}
                </td>
                <td>
                  {r.photoUrl ? (
                    <button
                      className="record-photo-thumb"
                      onClick={() => setSelected(r)}
                      aria-label={`View ${r.year} team photo`}
                      title={`View ${r.year} team photo`}
                    >
                      <img src={r.thumbUrl || r.photoUrl} alt={`${r.year} team`} loading="lazy" width="80" height="60" />
                    </button>
                  ) : <span className="record-photo-empty">No photo yet</span>}
                </td>
                <td>{r.team}</td>
                <td>{r.score}</td>
                <td><button className="year-link" type="button" aria-label={`View ${r.year} roster`} onClick={() => setRosterYear(r.year)}>View Roster</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      {onViewAll && <button className="year-link" onClick={onViewAll}>View the record book</button>}
      {rosterYear !== null && <RosterDialog key={rosterYear} year={rosterYear} onClose={() => setRosterYear(null)} />}

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div
            className="photo-modal record-carousel"
            ref={viewerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Record Book team photos"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
            onTouchEnd={(event) => {
              if (touchStart.current === null) return;
              const distance = touchStart.current - event.changedTouches[0].clientX;
              if (Math.abs(distance) > 50) movePhoto(distance > 0 ? 1 : -1);
              touchStart.current = null;
            }}
          >
            <button className="close" onClick={() => setSelected(null)} aria-label="Close photos">x</button>
            <ZoomablePhoto photoKey={selected.year} src={selected.photoUrl} alt={`${selected.year} group photo`} caption={`${selected.year} | ${selected.team} | ${selected.score}`} onPrevious={() => movePhoto(-1)} onNext={() => movePhoto(1)} />
            {photos.length > 1 && (
              <div className="record-carousel-controls">
                <button type="button" onClick={() => movePhoto(-1)} aria-label="Previous year's photo" title="Previous photo">&larr;</button>
                <span>{selectedIndex + 1} / {photos.length}</span>
                <button type="button" onClick={() => movePhoto(1)} aria-label="Next year's photo" title="Next photo">&rarr;</button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
