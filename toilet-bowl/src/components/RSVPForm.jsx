import { useCallback, useEffect, useMemo, useState } from "react";
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createThumbnail } from "../utils/createThumbnail";

const PROFILE_YEAR = 2026;

function safeFileName(fileName) {
  const extension = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : ".jpg";
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");

  return `${base || "profile"}${extension.toLowerCase()}`;
}

function profileIdFor(rsvpId, name) {
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `${PROFILE_YEAR}_${safeName || "player"}_${rsvpId}`;
}

export default function RSVPForm({ onClose }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("playing");
  const [count, setCount] = useState(0);
  const [savedRsvp, setSavedRsvp] = useState(null);
  const [profileBlurb, setProfileBlurb] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const rsvpsRef = useMemo(() => collection(db, "rsvps"), []);

  const refreshCount = useCallback(async () => {
    const snap = await getDocs(rsvpsRef);
    setCount(snap.size);
  }, [rsvpsRef]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    const trimmedName = name.trim();

    try {
      const rsvpDoc = await addDoc(rsvpsRef, {
        name: trimmedName,
        status,
        createdAt: serverTimestamp(),
        year: PROFILE_YEAR,
      });

      await refreshCount();

      if (status === "playing") {
        setSavedRsvp({ id: rsvpDoc.id, name: trimmedName });
        setProfileMessage("RSVP saved. Want to add a player profile?");
      } else {
        alert("RSVP saved! See you there!");
        setName("");
        setStatus("playing");
        onClose();
      }
    } catch (err) {
      console.error("RSVP save failed:", err);
      alert("Couldn't save RSVP. Check console and Firestore rules.");
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    if (!savedRsvp || !profileImage || !profileBlurb.trim()) return;

    setProfileSaving(true);
    setProfileMessage("Creating player profile...");

    const profileId = profileIdFor(savedRsvp.id, savedRsvp.name);
    const fullName = safeFileName(profileImage.name);
    const thumbName = fullName.replace(/\.[^.]+$/, ".jpg");
    const fullPath = `players-full/${PROFILE_YEAR}/${profileId}_${fullName}`;
    const thumbPath = `players-index/${PROFILE_YEAR}/${profileId}_${thumbName}`;

    try {
      const thumbnail = await createThumbnail(profileImage, 480);
      const fullRef = ref(storage, fullPath);
      const thumbRef = ref(storage, thumbPath);

      await uploadBytes(fullRef, profileImage, {
        contentType: profileImage.type || "image/jpeg",
        cacheControl: "public,max-age=31536000,immutable",
      });

      await uploadBytes(thumbRef, thumbnail, {
        contentType: "image/jpeg",
        cacheControl: "public,max-age=31536000,immutable",
      });

      const [imageUrl, thumbUrl] = await Promise.all([
        getDownloadURL(fullRef),
        getDownloadURL(thumbRef),
      ]);

      await setDoc(
        doc(collection(db, "playersIndex"), profileId),
        {
          year: PROFILE_YEAR,
          name: savedRsvp.name,
          status: "playing",
          blurb: profileBlurb.trim(),
          imagePath: fullPath,
          thumbPath,
          imageUrl,
          thumbUrl,
          rsvpId: savedRsvp.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setProfileMessage("Profile saved!");
      setName("");
      setStatus("playing");
      setProfileBlurb("");
      setProfileImage(null);
      window.setTimeout(onClose, 700);
    } catch (err) {
      console.error("Player profile save failed:", err);
      setProfileMessage("Profile failed to save. Check Firebase permissions.");
    } finally {
      setProfileSaving(false);
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
          x
        </button>

        {!savedRsvp ? (
          <>
            <h2 className="my-h2">RSVP</h2>
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
          </>
        ) : (
          <>
            <h2 className="my-h2">Player Profile</h2>
            <p className="profile-prompt">{profileMessage}</p>
            <form onSubmit={handleProfileSubmit}>
              <input value={savedRsvp.name} readOnly />
              <textarea
                value={profileBlurb}
                onChange={(e) => setProfileBlurb(e.target.value)}
                placeholder="Tell the roster about your game, your nickname, or your questionable scouting report."
                maxLength={240}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
              />
              <button
                type="submit"
                disabled={!profileImage || !profileBlurb.trim() || profileSaving}
              >
                {profileSaving ? "Saving..." : "Save Profile"}
              </button>
              <button type="button" className="secondary-btn" onClick={onClose}>
                Maybe Later
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
