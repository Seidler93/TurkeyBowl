import {
  collection,
  getDocs,
  limit as limitQuery,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

function mapGalleryPhoto(photoDoc) {
  const data = photoDoc.data();
  return {
    id: photoDoc.id,
    fileName: data.fileName,
    thumbUrl: data.thumbUrl,
    fullUrl: data.fullUrl || data.thumbUrl,
    fullPath: data.fullPath,
    sortOrder: data.sortOrder,
  };
}

export async function getGalleryIndex(timeline, maxItems = 50) {
  const page = await getGalleryIndexPage(timeline, maxItems);
  return page.photos;
}

export async function getGalleryIndexPage(timeline, pageSize = 50, cursor = null) {
  try {
    const constraints = [
      where("timeline", "==", timeline),
      orderBy("sortOrder"),
    ];

    if (cursor !== null && cursor !== undefined) {
      constraints.push(startAfter(cursor));
    }

    constraints.push(limitQuery(pageSize + 1));

    const galleryQuery = query(
      collection(db, "galleryIndex"),
      ...constraints
    );
    const snapshot = await getDocs(galleryQuery);
    const rows = snapshot.docs.map(mapGalleryPhoto);
    const photos = rows.slice(0, pageSize);
    const lastPhoto = photos[photos.length - 1];

    return {
      photos,
      hasMore: rows.length > pageSize,
      cursor: lastPhoto ? lastPhoto.sortOrder : cursor,
    };
  } catch (error) {
    console.error("Error fetching gallery index:", error);
    return {
      photos: [],
      hasMore: false,
      cursor,
    };
  }
}
