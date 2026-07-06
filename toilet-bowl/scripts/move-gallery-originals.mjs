import { initializeApp } from "firebase/app";
import {
  deleteObject,
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
const destinationFolder = args.dest || `gallery-full/${year}`;
const limit = args.limit ? Number(args.limit) : Infinity;
const dryRun = args["dry-run"] === "true";
const deleteSource = args["delete-source"] === "true";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

function baseName(path) {
  return path.split("/").pop() || path;
}

async function downloadBuffer(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed with ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function copyImage(itemRef, index, total) {
  const fileName = baseName(itemRef.fullPath);
  const destinationPath = `${destinationFolder}/${fileName}`;
  const destinationRef = ref(storage, destinationPath);

  if (dryRun) {
    const action = deleteSource ? "move" : "copy";
    console.log(`[${index}/${total}] [dry-run] ${action}: ${itemRef.fullPath} -> ${destinationPath}`);
    return;
  }

  console.log(`[${index}/${total}] Getting download URL for ${itemRef.fullPath}...`);
  const fullUrl = await getDownloadURL(itemRef);

  console.log(`[${index}/${total}] Downloading ${itemRef.fullPath}...`);
  const original = await downloadBuffer(fullUrl);
  console.log(`[${index}/${total}] Downloaded ${itemRef.fullPath} (${formatBytes(original.length)}).`);

  console.log(`[${index}/${total}] Uploading to ${destinationPath}...`);
  await uploadBytes(destinationRef, original, {
    contentType: "image/jpeg",
    cacheControl: "public,max-age=31536000,immutable",
  });
  console.log(`[${index}/${total}] Uploaded ${destinationPath}.`);

  if (deleteSource) {
    console.log(`[${index}/${total}] Deleting source ${itemRef.fullPath}...`);
    await deleteObject(itemRef);
    console.log(`[${index}/${total}] Deleted source ${itemRef.fullPath}.`);
  }

  const action = deleteSource ? "Moved" : "Copied";
  console.log(`[${index}/${total}] ${action}: ${itemRef.fullPath} -> ${destinationPath}`);
}

async function main() {
  console.log(`Listing ${sourceFolder} for ${year}...`);
  console.log(`Originals will be copied to ${destinationFolder}.`);
  console.log(`Delete source after copy: ${deleteSource ? "yes" : "no"}.`);

  const result = await listAll(ref(storage, sourceFolder));
  const images = result.items
    .filter((item) => /\.(jpe?g|png|webp)$/i.test(item.name))
    .slice(0, limit);

  console.log(`Processing ${images.length} of ${result.items.length} images.`);

  let succeeded = 0;
  let failed = 0;

  for (const [index, item] of images.entries()) {
    try {
      await copyImage(item, index + 1, images.length);
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
