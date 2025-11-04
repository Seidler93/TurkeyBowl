// src/components/PreviousWinners.jsx
import { useEffect, useState } from "react";
import { db, collection, getDocs } from "../firebase";
import { storage } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";

export default function PreviousWinners() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null); // {year, team, score, photoUrl}

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const snap = await getDocs(collection(db, "winners"));
        const data = await Promise.all(
          snap.docs
            .map((d) => d.data())
            .sort((a, b) => b.year - a.year)
            .map(async (w) => {
              let photoUrl = "";
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
        setRows(data);
      } catch (e) {
        console.error("Failed to load winners:", e);
      }
    };
    fetchWinners();
  }, []);

  return (
    <section id="winners" className="winners">
      <h2>Previous Winners</h2>
      <p className="subtitle">Tap a year to view that year’s squad photo.</p>

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
                  <button
                    className="year-link"
                    onClick={() =>
                      r.photoUrl
                        ? setSelected(r)
                        : alert("No photo available for this year.")
                    }
                    title="View group photo"
                  >
                    {r.year}
                  </button>
                </td>
                <td>{r.team}</td>
                <td>{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Photo Modal */}
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>×</button>
            <div className="photo-header">
              <strong>{selected.year}</strong> • {selected.team} • {selected.score}
            </div>
            <img src={selected.photoUrl} alt={`${selected.year} winners`} />
          </div>
        </div>
      )}
    </section>
  );
}
