import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import app from "../firebase";

const storage = getStorage(app);

export async function getImageItems(folderName) {
  try {
    const folderRef = ref(storage, folderName);
    const result = await listAll(folderRef);
    return Promise.all(
      result.items.map(async (item) => ({
        name: item.name,
        path: item.fullPath,
        url: await getDownloadURL(item),
      }))
    );
  } catch (error) {
    console.error("Error fetching images from Firebase Storage:", error);
    return [];
  }
}

export async function getImages(folderName) {
  const items = await getImageItems(folderName);
  return items.map((item) => item.url);
}

export async function getImageUrl(path) {
  return getDownloadURL(ref(storage, path));
}
