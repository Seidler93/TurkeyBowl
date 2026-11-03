import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import useGameYear from "../utils/useGameYear";

export default function PlayersPage() {
  const gameYear = useGameYear();
  const yearOptions = Array.from({ length: gameYear - 2024 + 1 }, (_, index) => gameYear - index);
  const [yearChoice, setYearChoice] = useState(null);
  const selectedYear = yearChoice ?? gameYear;
  const [attendees, setAttendees] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    setAttendees([]);
    setProfiles([]);
    const unsubscribeAttendance = onSnapshot(
      query(collection(db, "rsvps"), where("year", "==", selectedYear)),
      (snapshot) => {
        setAttendees(snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id })));
        setLoading(false);
      },
      (loadError) => {
        console.error("Failed to load attendance:", loadError);
        setError("Could not load this year's roster. Please try again later.");
        setLoading(false);
      }
    );
    const unsubscribeProfiles = onSnapshot(
      query(collection(db, "playersIndex"), where("year", "==", selectedYear)),
      (snapshot) => setProfiles(snapshot.docs.map((entry) => entry.data())),
      (loadError) => {
        console.error("Failed to load player profiles:", loadError);
        setProfiles([]);
      }
    );
    return () => {
      unsubscribeAttendance();
      unsubscribeProfiles();
    };
  }, [selectedYear]);

  const players = useMemo(() => {
    const profilesByRsvp = new Map(profiles.map((profile) => [profile.rsvpId, profile]));
    return attendees
      .filter((attendee) => attendee.status === "playing")
      .map((attendee) => ({ ...profilesByRsvp.get(attendee.id), ...attendee }))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [attendees, profiles]);

  const playerCountLabel = useMemo(() => {
    if (loading) return "Loading roster...";
    if (players.length === 1) return "1 player signed up";
    return `${players.length} players signed up`;
  }, [loading, players.length]);

  return (
    <div className="players-page">
      <div className="page-header">
        <p className="eyebrow">Toilet Bowl Roster</p>
        <h1>Players</h1>
        <p>Meet the players signed up for the {selectedYear} game.</p>
      </div>

      <div className="gallery-toolbar">
        <label htmlFor="players-year">Year</label>
        <select
          id="players-year"
          value={selectedYear}
          onChange={(e) => setYearChoice(Number(e.target.value))}
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <p className="players-count" role="status">{error || playerCountLabel}</p>

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
              {player.thumbUrl || player.imageUrl ? (
                <img
                  className="player-photo"
                  src={player.thumbUrl || player.imageUrl}
                  alt={player.name}
                  loading="lazy"
                />
              ) : (
                <div className="player-photo-placeholder">
                  <span>{player.name?.charAt(0) || "?"}</span>
                </div>
              )}
              <div className="player-info">
                <h3>{player.name}</h3>
                <p>{player.blurb || "Player profile coming soon."}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        !error && <p className="empty-gallery">No players have signed up for {selectedYear} yet.</p>
      )}
    </div>
  );
}
