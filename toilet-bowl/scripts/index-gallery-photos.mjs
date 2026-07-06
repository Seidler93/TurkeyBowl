import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  listAll,
  ref,
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

const timeline = args.timeline || "2024";
const year = args.year ? Number(args.year) : Number(timeline) || null;
const thumbFolder = args.thumbs || `gallery-thumbs/${timeline}`;
const fullFolder = args.full || `gallery-full/${timeline}`;
const collectionName = args.collection || "galleryIndex";
const limit = args.limit ? Number(args.limit) : Infinity;
const dryRun = args["dry-run"] === "true";
const testWrite = args["test-write"] === "true";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

function imageKey(fileName) {
  return fileName.replace(/\.[^.]+$/, "");
}

function docIdFor(fileName) {
  return `${timeline}_${imageKey(fileName).replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

async function listImageItems(folderName) {
  const result = await listAll(ref(storage, folderName));
  const imageRefs = result.items.filter((item) => /\.(jpe?g|png|webp)$/i.test(item.name));

  return Promise.all(
    imageRefs.map(async (item) => ({
      name: item.name,
      path: item.fullPath,
      url: await getDownloadURL(item),
    }))
  );
}

async function main() {
  console.log(`Building ${collectionName} for timeline "${timeline}".`);
  console.log(`Thumbnail folder: ${thumbFolder}`);
  console.log(`Full image folder: ${fullFolder}`);
  console.log(`Dry run: ${dryRun ? "yes" : "no"}`);

  if (testWrite) {
    const testDocId = "_write_test";
    console.log(`Testing Firestore write to ${collectionName}/${testDocId}...`);
    await setDoc(
      doc(collection(db, collectionName), testDocId),
      {
        timeline: "test",
        ok: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`Test write succeeded: ${collectionName}/${testDocId}`);
    return;
  }

  const [thumbItems, fullItems] = await Promise.all([
    listImageItems(thumbFolder),
    listImageItems(fullFolder),
  ]);

  const fullByKey = new Map(fullItems.map((item) => [imageKey(item.name), item]));
  const photos = thumbItems.slice(0, limit);

  console.log(`Found ${thumbItems.length} thumbnails and ${fullItems.length} full images.`);
  console.log(`Indexing ${photos.length} photos.`);

  let succeeded = 0;
  let failed = 0;
  let missingFull = 0;

  for (const [index, thumb] of photos.entries()) {
    const key = imageKey(thumb.name);
    const full = fullByKey.get(key);
    const docId = docIdFor(thumb.name);

    if (!full) {
      missingFull++;
    }

    const photoDoc = {
      timeline,
      year,
      fileName: thumb.name,
      thumbPath: thumb.path,
      fullPath: full?.path || null,
      thumbUrl: thumb.url,
      fullUrl: full?.url || thumb.url,
      sortOrder: index + 1,
      updatedAt: serverTimestamp(),
    };

    try {
      if (dryRun) {
        console.log(`[${index + 1}/${photos.length}] [dry-run] ${collectionName}/${docId}`);
      } else {
        await setDoc(doc(collection(db, collectionName), docId), photoDoc, { merge: true });
        console.log(`[${index + 1}/${photos.length}] Wrote ${collectionName}/${docId}`);
      }

      succeeded++;
    } catch (error) {
      failed++;
      console.error(`[${index + 1}/${photos.length}] Failed ${collectionName}/${docId}:`, error);
    }

    console.log(
      `Progress: ${succeeded} succeeded, ${failed} failed, ${missingFull} missing full images, ${photos.length - index - 1} remaining.`
    );
  }

  console.log(`Done. ${succeeded} succeeded, ${failed} failed, ${missingFull} missing full images.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
