// src/utils/getImages.js
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import app from "../firebase";

const storage = getStorage(app);

/**
 * Fetch all image URLs from a folder in Firebase Storage
 * @param {string} folderName - Name of the folder, e.g. "gallery" or "backgrounds"
 */
export async function getImages(folderName) {
  console.log(folderName);
  
  try {
    const folderRef = ref(storage, folderName);
    const result = await listAll(folderRef);
    const urls = await Promise.all(result.items.map((item) => getDownloadURL(item)));
    console.log("hi" + urls);
    
    return urls;
  } catch (error) {
    console.error("Error fetching images from Firebase Storage:", error);
    return [];
  }
}
