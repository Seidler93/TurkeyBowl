import { db, storage } from "../src/firebase.js";
import { collection, doc, getDocsFromServer, runTransaction } from "firebase/firestore";
import { getDownloadURL, getMetadata, ref, uploadBytes } from "firebase/storage";

try {
  const source = await getDocsFromServer(collection(db, "winners"));
  for (const entry of source.docs) {
    const data = entry.data();
    const year = Number(data.year);
    if (!Number.isInteger(year)) throw new Error(`Invalid year in ${entry.id}`);
    const target = doc(db, "years", String(year));
    let photoPath = "";
    if (data.photoPath) {
      photoPath = `years/${year}.jpg`;
      const destination = ref(storage, photoPath);
      let exists = false;
      try {
        await getMetadata(destination);
        exists = true;
      } catch (error) {
        if (error.code !== "storage/object-not-found") throw error;
      }
      if (!exists) {
        const url = await getDownloadURL(ref(storage, data.photoPath));
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Photo download failed for ${year}`);
        await uploadBytes(destination, new Uint8Array(await response.arrayBuffer()), {
          contentType: "image/jpeg",
          cacheControl: "public,max-age=3600",
        });
      }
      console.log(`Photo ready: ${photoPath}`);
    }
    await runTransaction(db, async (transaction) => {
      const existing = await transaction.get(target);
      if (existing.exists()) return;
      transaction.set(target, { year, team: data.team, score: data.score, photoPath });
    });
    console.log(`Year ready: years/${year}`);
  }
  console.log("Migration complete. Original records and photos retained for the existing live site.");
  process.exit(0);
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
}
