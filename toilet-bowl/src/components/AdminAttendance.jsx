import { useEffect, useRef, useState } from "react";
import { collection, doc, onSnapshot, query, runTransaction, where } from "firebase/firestore";
import { db } from "../firebase";
import useGameYear from "../utils/useGameYear";

export default function AdminAttendance() {
  const year = useGameYear();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [candidate, setCandidate] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [message, setMessage] = useState("");
  const dialog = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    setAttendees([]);
    return onSnapshot(query(collection(db, "rsvps"), where("year", "==", year)), (snapshot) => {
      setAttendees(snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id }))
        .filter((entry) => entry.status === "playing")
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")));
      setLoading(false);
    }, (loadError) => {
      console.error("Could not load admin attendance:", loadError);
      setError("Could not load attendance. Please refresh to try again.");
      setLoading(false);
    });
  }, [year]);

  useEffect(() => {
    if (!candidate) return;
    const modal = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.showModal();
    return () => {
      modal.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [candidate]);

  async function removeAttendee() {
    if (!candidate || removing) return;
    setRemoving(true);
    setRemoveError("");
    try {
      if (candidate.year !== year) throw new Error("The active game year has changed. Close this dialog and try again.");
      await runTransaction(db, async (transaction) => {
        const target = doc(db, "rsvps", candidate.id);
        const snapshot = await transaction.get(target);
        if (!snapshot.exists()) return;
        if (snapshot.data().year !== candidate.year) throw new Error("This RSVP has changed. Close this dialog and refresh attendance.");
        transaction.delete(target);
      });
      setMessage(`${candidate.name} removed from ${candidate.year} attendance.`);
      setCandidate(null);
    } catch (deleteError) {
      console.error("Could not remove RSVP:", deleteError);
      setRemoveError("Could not remove this attendee. Please close and try again.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section className="admin-attendance" aria-labelledby="admin-attendance-title">
      <h2 id="admin-attendance-title">{year} Attendance</h2>
      {loading ? <p role="status">Loading attendance...</p> : error ? <p role="alert">{error}</p> : (
        <>
          <p>{attendees.length} player{attendees.length === 1 ? "" : "s"} signed up</p>
          {attendees.length === 0 ? <p>No players have signed up yet.</p> : (
            <ul className="admin-attendee-list">
              {attendees.map((attendee) => (
                <li key={attendee.id}>
                  <span>{attendee.name}</span>
                  <button type="button" className="admin-remove-button" aria-label={`Remove ${attendee.name}`} onClick={() => {
                    setRemoveError("");
                    setMessage("");
                    setCandidate({ ...attendee, year });
                  }}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {message && <p role="status">{message}</p>}
      <dialog className="admin-confirm-dialog" ref={dialog} aria-labelledby="remove-attendee-title" aria-describedby="remove-attendee-description"
        onCancel={(event) => { event.preventDefault(); if (!removing) setCandidate(null); }}>
        <h2 id="remove-attendee-title">Remove attendee?</h2>
        <p id="remove-attendee-description">Remove <strong>{candidate?.name}</strong> from {candidate?.year} attendance? Their RSVP will be deleted.</p>
        {removeError && <p role="alert">{removeError}</p>}
        <div className="admin-confirm-actions">
          <button type="button" autoFocus disabled={removing} onClick={() => setCandidate(null)}>Cancel</button>
          <button type="button" className="admin-remove-button" disabled={removing} onClick={removeAttendee}>{removing ? "Removing..." : "Remove Attendee"}</button>
        </div>
      </dialog>
    </section>
  );
}
