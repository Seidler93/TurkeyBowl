import { getImageUrl } from './getImages.js';

const images = new Map();
const paths = new Map();

function remember(cache, key, promise, limit) {
  cache.set(key, promise);
  if (cache.size > limit) cache.delete(cache.keys().next().value);
  promise.catch(() => { if (cache.get(key) === promise) cache.delete(key); });
  return promise;
}

function decodePhoto(url) {
  if (images.has(url)) return images.get(url);
  return remember(images, url, new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = async () => {
      if (image.decode) await image.decode().catch(() => {});
      resolve(url);
    };
    image.onerror = () => reject(new Error('Photo could not be loaded'));
    image.src = url;
  }), 24);
}

export async function loadViewerPhoto({ fullUrl, photoUrl, fullPath, thumbUrl }) {
  try {
    let url = fullUrl || photoUrl;
    if (!url && fullPath) {
      if (!paths.has(fullPath)) remember(paths, fullPath, getImageUrl(fullPath), 128);
      url = await paths.get(fullPath);
    }
    if (!url) url = thumbUrl;
    if (!url) throw new Error('Photo URL is missing');
    return await decodePhoto(url);
  } catch (error) {
    if (thumbUrl) return decodePhoto(thumbUrl);
    throw error;
  }
}
