import { useEffect, useState } from "react";
import { db, collection, getDocs } from "../firebase";

export default function Attendance() {
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    const fetchRSVPs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "rsvps"));
        const rsvpList = querySnapshot.docs.map((doc) => doc.data());
        setAttendees(rsvpList);
      } catch (error) {
        console.error("Error fetching RSVPs:", error);
      }
    };

    fetchRSVPs();
  }, []);

  const players = attendees.filter((a) => a.status === "playing");
  const watchers = attendees.filter((a) => a.status === "watching");

  return (
    <section id="attendance" className="attendance">
      <h2>Attendance</h2>
      <p className="subtitle">
        Who’s showing up to the <strong>Toilet Bowl 2025</strong>?
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
