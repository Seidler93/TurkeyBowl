import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export default function RSVPForm({ onClose }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("playing");
  const [count, setCount] = useState(0);
  const rsvpsRef = collection(db, "rsvps");

  async function refreshCount() {
    const snap = await getDocs(rsvpsRef);
    setCount(snap.size);
  }

  useEffect(() => {
    refreshCount();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await addDoc(rsvpsRef, {
        name: name.trim(),
        status, // "playing" or "watching"
        createdAt: serverTimestamp(),
        year: 2025,
      });
      setName("");
      setStatus("playing");
      await refreshCount();
      alert("RSVP saved! See you there!");
    } catch (err) {
      console.error("RSVP save failed:", err);
      alert("Couldn’t save RSVP. Check console and Firestore rules.");
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal")) {
      onClose();
    }
  };

  return (
    <div className="modal" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="close" onClick={onClose}>
          ✖
        </button>
        <h2>RSVP</h2>
        <form onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="playing">Playing</option>
            <option value="watching">Watching</option>
          </select>
          <button type="submit">Submit</button>
        </form>
        <p>
          <strong>{count}</strong> people are coming!
        </p>
      </div>
    </div>
  );
}
