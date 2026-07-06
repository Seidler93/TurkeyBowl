import {
  collection,
  getDocs,
  limit as limitQuery,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export async function getGalleryIndex(timeline, maxItems = 50) {
  try {
    const galleryQuery = query(
      collection(db, "galleryIndex"),
      where("timeline", "==", timeline),
      orderBy("sortOrder"),
      limitQuery(maxItems)
    );
    const snapshot = await getDocs(galleryQuery);

    return snapshot.docs.map((photoDoc) => {
      const data = photoDoc.data();
      return {
        id: photoDoc.id,
        fileName: data.fileName,
        thumbUrl: data.thumbUrl,
        fullUrl: data.fullUrl || data.thumbUrl,
        fullPath: data.fullPath,
        sortOrder: data.sortOrder,
      };
    });
  } catch (error) {
    console.error("Error fetching gallery index:", error);
    return [];
  }
}
