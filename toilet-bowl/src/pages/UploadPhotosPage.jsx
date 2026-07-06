import { useMemo, useState } from "react";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase";
import { createThumbnail } from "../utils/createThumbnail";

const ACCESS_CODE = "turkey";

const timelineOptions = [
  {
    label: "The Past",
    timeline: "The Past",
    folderKey: "past",
    year: null,
  },
  {
    label: "2024",
    timeline: "2024",
    folderKey: "2024",
    year: 2024,
  },
  {
    label: "2025",
    timeline: "2025",
    folderKey: "2025",
    year: 2025,
  },
];

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

export default function UploadPhotosPage() {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState("2025");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState([]);

  const selectedOption = useMemo(
    () => timelineOptions.find((option) => option.timeline === selectedTimeline) || timelineOptions[0],
    [selectedTimeline]
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

  const updateProgress = (fileName, status) => {
    setProgress((current) => {
      const existing = current.find((item) => item.fileName === fileName);
      if (existing) {
        return current.map((item) => item.fileName === fileName ? { ...item, status } : item);
      }

      return [...current, { fileName, status }];
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0 || uploading) return;

    setUploading(true);
    setMessage("");
    setProgress([]);

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
        updateProgress(file.name, "Creating thumbnail...");
        const thumbnail = await createThumbnail(file);

        updateProgress(file.name, "Uploading full photo...");
        const fullRef = ref(storage, fullPath);
        await uploadBytes(fullRef, file, {
          contentType: file.type || "image/jpeg",
          cacheControl: "public,max-age=31536000,immutable",
        });

        updateProgress(file.name, "Uploading thumbnail...");
        const thumbRef = ref(storage, thumbPath);
        await uploadBytes(thumbRef, thumbnail, {
          contentType: "image/jpeg",
          cacheControl: "public,max-age=31536000,immutable",
        });

        updateProgress(file.name, "Saving gallery index...");
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
        updateProgress(file.name, "Done");
      } catch (error) {
        failed++;
        console.error(`Upload failed for ${file.name}:`, error);
        updateProgress(file.name, "Failed");
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
            <ul className="upload-progress">
              {progress.map((item) => (
                <li key={item.fileName}>
                  <span>{item.fileName}</span>
                  <strong>{item.status}</strong>
                </li>
              ))}
            </ul>
          )}
        </form>
      )}
    </div>
  );
}
