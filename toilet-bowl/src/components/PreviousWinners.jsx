import { useEffect, useState } from "react";
import { db, collection, getDocs } from "../firebase";
import { storage } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";

export default function PreviousWinners({ latestOnly = false, showHeading = true, onViewAll }) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchWinners = async () => {
      setLoading(true);
      setError("");
      setSelected(null);
      try {
        const snap = await getDocs(collection(db, "winners"));
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
    <section id="winners" className="winners">
      {showHeading && <h2>{latestOnly ? "Latest Winners" : "Previous Winners"}</h2>}
      {loading && <p role="status">Loading results...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="subtitle">No results have been posted yet.</p>
      )}

      {!loading && !error && latestOnly && rows.length > 0 && (
        <figure className="latest-winner">
          <figcaption>
            <p className="eyebrow">{rows[0].year} Champions</p>
            <h3>{rows[0].team}</h3>
            <p className="latest-winner-score">{rows[0].score}</p>
          </figcaption>
          {rows[0].photoUrl ? (
            <button className="latest-winner-photo" onClick={() => setSelected(rows[0])} aria-label={`View ${rows[0].year} ${rows[0].team} team photo`}>
              <img src={rows[0].photoUrl} alt={`${rows[0].year} ${rows[0].team} winning team`} loading="lazy" />
            </button>
          ) : <p className="subtitle">Team photo coming soon.</p>}
        </figure>
      )}

      {!loading && !error && !latestOnly && rows.length > 0 && (
      <div className="winners-table-wrap">
        <table className="winners-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Winning Team</th>
              <th>Score</th>
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
                <td>{r.team}</td>
                <td>{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      {onViewAll && <button className="year-link" onClick={onViewAll}>View all previous winners</button>}

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>x</button>
            <div className="photo-header">
              <strong>{selected.year}</strong> | {selected.team} | {selected.score}
            </div>
            <img src={selected.photoUrl} alt={`${selected.year} winners`} />
          </div>
        </div>
      )}
    </section>
  );
}
