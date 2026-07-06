import { useEffect, useMemo, useState } from "react";

function getTimeParts(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export default function KickoffTimer() {
  const targetDate = useMemo(
    () => new Date("2026-11-26T09:00:00-06:00"),
    []
  );

  const [remaining, setRemaining] = useState(
    Math.max(targetDate - new Date(), 0)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(targetDate - new Date(), 0));
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const { days, hours, minutes, seconds } = getTimeParts(remaining);
  const isLive = remaining === 0;

  return (
    <section id="kickoff" className="kickoff">
      <h2>Kickoff Countdown</h2>
      <p className="subtitle">Newton Park | 9:00 AM</p>
      <p className="subtitle">Thursday, November 26, 2026</p>

      {!isLive ? (
        <div className="countdown">
          <div className="time-box">
            <span className="num">{String(days)}</span>
            <span className="label">Days</span>
          </div>
          <div className="time-box">
            <span className="num">{String(hours).padStart(2, "0")}</span>
            <span className="label">Hours</span>
          </div>
          <div className="time-box">
            <span className="num">{String(minutes).padStart(2, "0")}</span>
            <span className="label">Minutes</span>
          </div>
          <div className="time-box">
            <span className="num">{String(seconds).padStart(2, "0")}</span>
            <span className="label">Seconds</span>
          </div>
        </div>
      ) : (
        <div className="game-time">It's Game Time!</div>
      )}
    </section>
  );
}
