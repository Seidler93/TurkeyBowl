import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const yearOptions = [2026, 2025, 2024];

export default function PlayersPage() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayers() {
      setLoading(true);

      try {
        const playersQuery = query(
          collection(db, "playersIndex"),
          where("year", "==", Number(selectedYear))
        );
        const snap = await getDocs(playersQuery);
        const rows = snap.docs
          .map((playerDoc) => ({ id: playerDoc.id, ...playerDoc.data() }))
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setPlayers(rows);
      } catch (error) {
        console.error("Failed to load players:", error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    }

    loadPlayers();
  }, [selectedYear]);

  const playerCountLabel = useMemo(() => {
    if (loading) return "Loading roster...";
    if (players.length === 1) return "1 player checked in";
    return `${players.length} players checked in`;
  }, [loading, players.length]);

  return (
    <div className="players-page">
      <div className="page-header">
        <p className="eyebrow">Toilet Bowl Roster</p>
        <h1>Players</h1>
        <p>Meet the brave souls suiting up for this year's game.</p>
      </div>

      <div className="gallery-toolbar">
        <label htmlFor="players-year">Year</label>
        <select
          id="players-year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <p className="players-count">{playerCountLabel}</p>

      {loading ? (
        <div className="players-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div className="player-card player-card-loading" key={idx}>
              <div className="player-photo-placeholder">
                <span className="photo-loader" />
              </div>
            </div>
          ))}
        </div>
      ) : players.length > 0 ? (
        <div className="players-grid">
          {players.map((player) => (
            <article className="player-card" key={player.id}>
              <img
                className="player-photo"
                src={player.thumbUrl || player.imageUrl}
                alt={player.name}
                loading="lazy"
              />
              <div className="player-info">
                <h3>{player.name}</h3>
                <p>{player.blurb}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-gallery">No player profiles yet for {selectedYear}.</p>
      )}
    </div>
  );
}
