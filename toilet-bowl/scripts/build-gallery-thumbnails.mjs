import sharp from "sharp";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB8kI1JxasbjewAcivs6TqVmCV3ugiHoXM",
  authDomain: "turkeybowl-743d7.firebaseapp.com",
  projectId: "turkeybowl-743d7",
  storageBucket: "turkeybowl-743d7.firebasestorage.app",
  messagingSenderId: "710583018177",
  appId: "1:710583018177:web:db56771265e5576cb9aa40",
};

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  })
);

const year = args.year || "2024";
const sourceFolder = args.source || "gallery";
const thumbnailFolder = args.thumbs || `gallery-thumbs/${year}`;
const limit = args.limit ? Number(args.limit) : Infinity;
const dryRun = args["dry-run"] === "true";
const writeDb = args["write-db"] === "true";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

function baseName(path) {
  return path.split("/").pop() || path;
}

function docIdFor(fileName) {
  return `${year}_${fileName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

async function downloadBuffer(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed with ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function makeThumbnail(inputBuffer) {
  return sharp(inputBuffer)
    .rotate()
    .resize({
      width: 640,
      height: 640,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 72,
      mozjpeg: true,
    })
    .toBuffer();
}

async function processImage(itemRef, index, total) {
  const fileName = baseName(itemRef.fullPath);
  const thumbName = fileName.replace(/\.[^.]+$/, ".jpg");
  const thumbPath = `${thumbnailFolder}/${thumbName}`;
  const thumbRef = ref(storage, thumbPath);
  const fullUrl = await getDownloadURL(itemRef);

  if (dryRun) {
    console.log(`[${index}/${total}] [dry-run] ${itemRef.fullPath} -> ${thumbPath}`);
    return { ok: true, thumbPath };
  }

  const original = await downloadBuffer(fullUrl);
  const thumbnail = await makeThumbnail(original);

  await uploadBytes(thumbRef, thumbnail, {
    contentType: "image/jpeg",
    cacheControl: "public,max-age=31536000,immutable",
  });

  const thumbUrl = await getDownloadURL(thumbRef);

  if (writeDb) {
    await setDoc(
      doc(collection(db, "galleryPhotos"), docIdFor(fileName)),
      {
        year: Number(year),
        fileName,
        fullPath: itemRef.fullPath,
        thumbPath,
        fullUrl,
        thumbUrl,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  const dbStatus = writeDb ? ` and updated galleryPhotos/${docIdFor(fileName)}` : "";
  console.log(`[${index}/${total}] Created thumbnail: ${itemRef.fullPath} -> ${thumbPath}${dbStatus}`);
  return { ok: true, thumbPath };
}

async function main() {
  console.log(`Listing ${sourceFolder} for ${year}...`);
  console.log(`Thumbnails will be uploaded to ${thumbnailFolder}.`);
  console.log(`Firestore writes are ${writeDb ? "enabled" : "disabled"}.`);
  const result = await listAll(ref(storage, sourceFolder));
  const images = result.items
    .filter((item) => /\.(jpe?g|png|webp)$/i.test(item.name))
    .slice(0, limit);

  console.log(`Processing ${images.length} of ${result.items.length} images.`);

  let succeeded = 0;
  let failed = 0;

  for (const [index, item] of images.entries()) {
    try {
      await processImage(item, index + 1, images.length);
      succeeded++;
    } catch (error) {
      failed++;
      console.error(`[${index + 1}/${images.length}] Failed ${item.fullPath}:`, error);
    }

    console.log(`Progress: ${succeeded} succeeded, ${failed} failed, ${images.length - index - 1} remaining.`);
  }

  console.log(`Done. ${succeeded} succeeded, ${failed} failed.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
