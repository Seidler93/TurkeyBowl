import { useEffect, useState } from "react";
import { db } from "../firebase";
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import useGameYear from "../utils/useGameYear";

export default function RSVPForm({ onClose }) {
  const year = useGameYear();
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => onSnapshot(
    query(collection(db, "rsvps"), where("year", "==", year)),
    (snapshot) => setCount(snapshot.size),
    (loadError) => console.error("Could not load RSVP count:", loadError)
  ), [year]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      await addDoc(collection(db, "rsvps"), {
        name: name.trim(),
        status: "playing",
        year,
        createdAt: serverTimestamp(),
      });
      alert("RSVP saved! See you there!");
      onClose();
    } catch (saveError) {
      console.error("RSVP save failed:", saveError);
      setError("Couldn't save your RSVP. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal" onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="modal-content">
        <button className="close" onClick={onClose} aria-label="Close RSVP">x</button>
        <h2 className="my-h2">RSVP for {year}</h2>
        <form onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            aria-label="Your name"
            required
            disabled={saving}
          />
          <button type="submit" disabled={saving || !name.trim()}>{saving ? "Saving..." : "Submit"}</button>
          {error && <p role="alert">{error}</p>}
        </form>
        <p><strong>{count}</strong> people are coming!</p>
      </div>
    </div>
  );
}
