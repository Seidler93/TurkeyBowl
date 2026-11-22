import { useMemo, useState } from "react";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../firebase";
import { createThumbnail } from "../utils/createThumbnail";
import useGalleryTimelines from "../utils/useGalleryTimelines";

const ACCESS_CODE = "turkey";

function safeFileName(fileName) {
  const extension = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : ".jpg";
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");

  return `${base || "photo"}${extension.toLowerCase()}`;
}

function docIdFor(timeline, fileName) {
  return `${timeline}_${fileName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function uploadWithProgress(storageRef, file, metadata, onProgress) {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, metadata);
    task.on("state_changed", (snapshot) => {
      onProgress(snapshot.bytesTransferred);
    }, reject, () => resolve(task.snapshot));
  });
}

export default function UploadPhotosPage() {
  const timelineOptions = useGalleryTimelines();
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [timelineChoice, setSelectedTimeline] = useState(null);
  const selectedTimeline = timelineChoice ?? timelineOptions[0].timeline;
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState([]);

  const selectedOption = useMemo(
    () => timelineOptions.find((option) => option.timeline === selectedTimeline) || timelineOptions[0],
    [selectedTimeline, timelineOptions]
  );

  const handleCodeSubmit = (e) => {
    e.preventDefault();

    if (code.trim().toLowerCase() === ACCESS_CODE) {
      setUnlocked(true);
      setMessage("");
    } else {
      setMessage("That code is not quite right.");
    }
  };

  const overallPercent = progress.length ? Math.floor(progress.reduce(
    (total, item) => total + (item.status === "Failed" ? 100 : item.percent), 0
  ) / progress.length) : 0;
  const completedCount = progress.filter((item) => item.status === "Done").length;
  const failedCount = progress.filter((item) => item.status === "Failed").length;

  const updateProgress = (index, status, percent) => {
    setProgress((current) => current.map((item, itemIndex) => itemIndex === index
      ? { ...item, status, ...(percent === undefined ? {} : { percent }) }
      : item));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0 || uploading) return;

    setUploading(true);
    setMessage("");
    setProgress(files.map((file) => ({ fileName: file.name, status: "Queued", percent: 0 })));

    let succeeded = 0;
    let failed = 0;
    const stamp = Date.now();

    for (const [index, file] of files.entries()) {
      const originalName = safeFileName(file.name);
      const uniqueName = `${stamp}_${index + 1}_${originalName}`;
      const thumbName = uniqueName.replace(/\.[^.]+$/, ".jpg");
      const fullPath = `gallery-full/${selectedOption.folderKey}/${uniqueName}`;
      const thumbPath = `gallery-thumbs/${selectedOption.folderKey}/${thumbName}`;
      const docId = docIdFor(selectedOption.timeline, uniqueName);

      try {
        updateProgress(index, "Creating thumbnail...", 0);
        const thumbnail = await createThumbnail(file);
        const totalBytes = file.size + thumbnail.size;
        const transferPercent = (bytes) => Math.min(99, Math.floor(bytes / totalBytes * 99));

        updateProgress(index, "Uploading full photo...");
        const fullRef = ref(storage, fullPath);
        await uploadWithProgress(fullRef, file, {
          contentType: file.type || "image/jpeg",
          cacheControl: "public,max-age=31536000,immutable",
        }, (bytes) => updateProgress(index, "Uploading full photo...", transferPercent(bytes)));

        updateProgress(index, "Uploading thumbnail...");
        const thumbRef = ref(storage, thumbPath);
        await uploadWithProgress(thumbRef, thumbnail, {
          contentType: "image/jpeg",
          cacheControl: "public,max-age=31536000,immutable",
        }, (bytes) => updateProgress(index, "Uploading thumbnail...", transferPercent(file.size + bytes)));

        updateProgress(index, "Saving gallery index...", 99);
        const [fullUrl, thumbUrl] = await Promise.all([
          getDownloadURL(fullRef),
          getDownloadURL(thumbRef),
        ]);

        await setDoc(
          doc(collection(db, "galleryIndex"), docId),
          {
            timeline: selectedOption.timeline,
            year: selectedOption.year,
            fileName: uniqueName,
            originalFileName: file.name,
            fullPath,
            thumbPath,
            fullUrl,
            thumbUrl,
            sortOrder: stamp + index,
            uploadedAt: serverTimestamp(),
          },
          { merge: true }
        );

        succeeded++;
        updateProgress(index, "Done", 100);
      } catch (error) {
        failed++;
        console.error(`Upload failed for ${file.name}:`, error);
        updateProgress(index, "Failed");
      }
    }

    setUploading(false);
    setMessage(`Upload complete. ${succeeded} succeeded, ${failed} failed.`);
    setFiles([]);
  };

  return (
    <div className="upload-page">
      <div className="page-header">
        <p className="eyebrow">Toilet Bowl Gallery</p>
        <h1>Upload Photos</h1>
        <p>Add photos to the gallery. Full images and thumbnails will be uploaded automatically.</p>
      </div>

      {!unlocked ? (
        <form className="upload-card" onSubmit={handleCodeSubmit}>
          <label htmlFor="upload-code">Enter upload code</label>
          <input
            id="upload-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code"
            autoComplete="off"
          />
          <button type="submit">Continue</button>
          {message && <p className="upload-message">{message}</p>}
        </form>
      ) : (
        <form className="upload-card" onSubmit={handleUpload}>
          <label htmlFor="upload-year">Gallery year</label>
          <select
            id="upload-year"
            value={selectedTimeline}
            onChange={(e) => setSelectedTimeline(e.target.value)}
            disabled={uploading}
          >
            {timelineOptions.map((option) => (
              <option key={option.timeline} value={option.timeline}>
                {option.label}
              </option>
            ))}
          </select>

          <label htmlFor="photo-files">Choose photos</label>
          <input
            id="photo-files"
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />

          <button type="submit" disabled={files.length === 0 || uploading}>
            {uploading ? "Uploading..." : `Upload ${files.length || ""} Photo${files.length === 1 ? "" : "s"}`}
          </button>

          {message && <p className="upload-message">{message}</p>}

          {progress.length > 0 && (
            <div className="upload-batch-progress">
              <div className="upload-progress-label">
                <span>{completedCount} of {progress.length} uploaded{failedCount > 0 ? `, ${failedCount} failed` : ""}</span>
                <strong>{overallPercent}%</strong>
              </div>
              <progress max="100" value={overallPercent} aria-label="Overall photo upload progress" />
            </div>
          )}

          {progress.length > 0 && (
            <ul className="upload-progress">
              {progress.map((item, index) => (
                <li key={index}>
                  <span>{item.fileName}</span>
                  <strong>{item.status}{item.status.startsWith("Uploading") ? ` ${item.percent}%` : ""}</strong>
                  <progress max="100" value={item.percent} aria-label={`Upload progress for ${item.fileName}`} />
                </li>
              ))}
            </ul>
          )}
        </form>
      )}
    </div>
  );
}
