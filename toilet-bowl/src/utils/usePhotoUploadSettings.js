import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const settingsRef = () => doc(db, "settings", "photoUploads");

export function savePasswordlessUploads(enabled) {
  return setDoc(settingsRef(), { passwordlessUploads: enabled }, { merge: true });
}

export default function usePhotoUploadSettings() {
  const [settings, setSettings] = useState({ status: "loading", passwordless: false });

  useEffect(() => onSnapshot(settingsRef(), { includeMetadataChanges: true }, (snapshot) => {
    if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) {
      setSettings({ status: "unconfirmed", passwordless: false });
      return;
    }
    setSettings({ status: "ready", passwordless: snapshot.data()?.passwordlessUploads === true });
  }, () => {
    setSettings({ status: "error", passwordless: false });
  }), []);

  return settings;
}
