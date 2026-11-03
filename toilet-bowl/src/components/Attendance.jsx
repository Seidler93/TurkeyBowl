import { useEffect, useState } from "react";
import { db, collection } from "../firebase";
import { onSnapshot, query, where } from "firebase/firestore";
import useGameYear from "../utils/useGameYear";

export default function Attendance() {
  const year = useGameYear();
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "rsvps"), where("year", "==", year)),
      (querySnapshot) => {
        const rsvpList = querySnapshot.docs.map((doc) => doc.data());
        setAttendees(rsvpList);
      },
      (error) => {
        console.error("Error fetching RSVPs:", error);
      }
    );
  }, [year]);

  const players = attendees.filter((a) => a.status === "playing");
  const watchers = attendees.filter((a) => a.status === "watching");

  return (
    <section id="attendance" className="attendance">
      <h2>Attendance</h2>
      <p className="subtitle">
        Who's showing up to the <strong>Toilet Bowl {year}</strong>?
      </p>

      <div className="attendance-lists">
        <div className="list">
          <h3>Playing ({players.length})</h3>
          {players.length > 0 ? (
            <ul>
              {players.map((p, i) => (
                <li key={i}>{p.name}</li>
              ))}
            </ul>
          ) : (
            <p className="empty">No players yet</p>
          )}
        </div>

        <div className="list">
          <h3>Watching ({watchers.length})</h3>
          {watchers.length > 0 ? (
            <ul>
              {watchers.map((w, i) => (
                <li key={i}>{w.name}</li>
              ))}
            </ul>
          ) : (
            <p className="empty">No watchers yet</p>
          )}
        </div>
      </div>
    </section>
  );
}
