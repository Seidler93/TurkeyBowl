import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

export default function RosterDialog({ year, onClose }) {
  const dialog = useRef(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const modal = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.showModal();
    return () => {
      modal.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    return onSnapshot(query(collection(db, "rsvps"), where("year", "==", Number(year))), (snapshot) => {
      setPlayers(snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id }))
        .filter((entry) => entry.status === "playing")
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")));
      setLoading(false);
    }, (loadError) => {
      console.error("Could not load year roster:", loadError);
      setError("Could not load this roster. Please close and try again.");
      setLoading(false);
    });
  }, [year]);

  return (
    <dialog ref={dialog} className="year-roster-dialog" aria-labelledby="year-roster-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className="year-roster-header">
        <h2 id="year-roster-title">{year} Roster</h2>
        <button type="button" onClick={onClose} aria-label="Close roster">&times;</button>
      </div>
      {loading ? <p role="status">Loading roster...</p> : error ? <p role="alert">{error}</p> : (
        <>
          <p>{players.length} player{players.length === 1 ? "" : "s"}</p>
          {players.length ? <ul className="year-roster-list">{players.map((player) => <li key={player.id}>{player.name}</li>)}</ul> : <p>No attendance has been saved for {year}.</p>}
        </>
      )}
    </dialog>
  );
}
