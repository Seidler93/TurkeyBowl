import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../firebase";
import { chicagoDate } from "../utils/gameYear";
import AdminAttendance from "../components/AdminAttendance";
import AdminPhotoUploadSettings from "../components/AdminPhotoUploadSettings";

const ADMIN_PIN = "0526";
const TEAM_OPTIONS = ["Beets", "Pics"];

export default function AdminPage() {
  const currentYear = Number(chicagoDate().slice(0, 4));
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [year, setYear] = useState(currentYear);
  const [team, setTeam] = useState("");
  const [score, setScore] = useState("");
  const [photo, setPhoto] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedYear, setLoadedYear] = useState(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fileKey, setFileKey] = useState(0);

  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    setLoading(true);
    setLoadedYear(null);
    setError("");
    setMessage("");
    setPhoto(null);
    setFileKey((value) => value + 1);
    setProgress(null);
    async function loadYear() {
      try {
        const snapshot = await getDoc(doc(db, "years", String(year)));
        const data = snapshot.data() || {};
        let url = data.photoUrl || "";
        if (!url && data.photoPath) url = await getDownloadURL(ref(storage, data.photoPath));
        if (!cancelled) {
          setTeam(TEAM_OPTIONS.find((option) => option.toLowerCase() === String(data.team || "").trim().toLowerCase()) || "");
          setScore(data.score || "");
          setExistingPhoto(url);
          setLoadedYear(year);
        }
      } catch (loadError) {
        console.error("Could not load year:", loadError);
        if (!cancelled) setError("Could not load this year's record. Select the year again to retry.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadYear();
    return () => { cancelled = true; };
  }, [unlocked, year]);

  async function saveYear(event) {
    event.preventDefault();
    if (saving || loading || loadedYear !== year || !TEAM_OPTIONS.includes(team) || !score.trim()) return;
    if (!photo && !existingPhoto) {
      setError("Choose a group photo for this year.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    setProgress(null);
    try {
      const data = { year, team: team.trim(), score: score.trim(), updatedAt: serverTimestamp() };
      if (photo) {
        if (!photo.type.startsWith("image/")) throw new Error("Please choose an image file.");
        const fileName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const photoPath = `years/${year}/group-${Date.now()}-${fileName}`;
        const photoRef = ref(storage, photoPath);
        setProgress(0);
        await new Promise((resolve, reject) => {
          const task = uploadBytesResumable(photoRef, photo, { contentType: photo.type });
          task.on("state_changed", (snapshot) => {
            setProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100));
          }, reject, resolve);
        });
        data.photoPath = photoPath;
        data.photoUrl = await getDownloadURL(photoRef);
      }
      await setDoc(doc(db, "years", String(year)), data, { merge: true });
      if (data.photoUrl) setExistingPhoto(data.photoUrl);
      setPhoto(null);
      setFileKey((value) => value + 1);
      setMessage(`${year} saved to The Record Book.`);
    } catch (saveError) {
      console.error("Could not save year:", saveError);
      setError("Could not save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="upload-page">
      <div className="page-header"><p className="eyebrow">Toilet Bowl</p><h1>Admin</h1></div>
      {!unlocked ? (
        <form className="upload-card" onSubmit={(event) => {
          event.preventDefault();
          if (pin === ADMIN_PIN) { setUnlocked(true); setPin(""); setError(""); }
          else setError("Incorrect PIN.");
        }}>
          <label htmlFor="admin-pin">Admin PIN</label>
          <input id="admin-pin" type="password" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={pin} onChange={(event) => setPin(event.target.value)} autoComplete="off" required />
          <button type="submit">Unlock</button>
          {error && <p role="alert">{error}</p>}
        </form>
      ) : (
        <form className="upload-card" onSubmit={saveYear}>
          <label htmlFor="record-year">Year</label>
          <select id="record-year" value={year} disabled={saving} onChange={(event) => setYear(Number(event.target.value))}>
            {Array.from({ length: currentYear - 2023 + 1 }, (_, index) => currentYear - index).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          {loading && <p role="status">Loading record...</p>}
          <fieldset className="team-toggle" disabled={loading || saving}>
            <legend>Winning team</legend>
            {TEAM_OPTIONS.map((option) => (
              <span className="team-toggle-option" key={option}>
                <input id={`record-team-${option.toLowerCase()}`} type="radio" name="winning-team" value={option} checked={team === option} onChange={() => setTeam(option)} required />
                <label htmlFor={`record-team-${option.toLowerCase()}`}>{option}</label>
              </span>
            ))}
          </fieldset>
          <label htmlFor="record-score">Score</label>
          <input id="record-score" placeholder="35-21" value={score} onChange={(event) => setScore(event.target.value)} disabled={loading || saving} required />
          <label htmlFor="record-photo">Group photo</label>
          <input key={fileKey} id="record-photo" type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] || null)} disabled={loading || saving} />
          {!loading && existingPhoto && <img className="admin-group-photo" src={existingPhoto} alt={`${year} saved group photo`} />}
          {saving && progress !== null && <div><progress max="100" value={progress} aria-label="Group photo upload progress" /><p role="status">{progress < 100 ? `Uploading photo: ${progress}%` : "Saving record..."}</p></div>}
          <button type="submit" disabled={loading || saving || loadedYear !== year || !team.trim() || !score.trim()}>{saving ? "Saving..." : "Save Year"}</button>
          {error && <p role="alert">{error}</p>}
          {message && <p role="status">{message}</p>}
        </form>
      )}
      {unlocked && <AdminPhotoUploadSettings />}
      {unlocked && <AdminAttendance />}
    </div>
  );
}
