import { useState } from "react";
import usePhotoUploadSettings, { savePasswordlessUploads } from "../utils/usePhotoUploadSettings";

export default function AdminPhotoUploadSettings() {
  const { status, passwordless } = usePhotoUploadSettings();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function update(enabled) {
    setSaving(true);
    setError(false);
    try {
      await savePasswordlessUploads(enabled);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="upload-card" aria-labelledby="photo-upload-settings-title">
      <h2 id="photo-upload-settings-title">Photo Upload Settings</h2>
      <label className="photo-upload-setting">
        <input type="checkbox" role="switch" checked={passwordless} disabled={saving || status !== "ready"} onChange={(event) => update(event.target.checked)} />
        Allow uploads without a password
      </label>
      <p>{passwordless ? "Anyone can upload photos without the code." : "The upload code is required by default."}</p>
      {saving && <p role="status">Saving upload setting...</p>}
      {!saving && status === "loading" && <p role="status">Loading upload setting...</p>}
      {!saving && (status === "error" || status === "unconfirmed") && <p role="alert">Could not verify the upload setting. Check your connection or Firestore permissions.</p>}
      {error && <p role="alert">Could not save the upload setting. Please try again.</p>}
    </section>
  );
}
