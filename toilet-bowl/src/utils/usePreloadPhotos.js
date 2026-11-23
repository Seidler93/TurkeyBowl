import { useEffect } from 'react';
import { loadViewerPhoto } from './viewerPhotos.js';

export default function usePreloadPhotos(photos, index) {
  useEffect(() => {
    if (index === null || index < 0 || photos.length < 2 || navigator.connection?.saveData) return;
    const timer = window.setTimeout(() => {
      const neighbors = new Set([1, 2, -1].map((offset) => (index + offset + photos.length) % photos.length));
      neighbors.delete(index);
      for (const neighbor of neighbors) loadViewerPhoto(photos[neighbor]).catch(() => {});
    }, 180);
    return () => window.clearTimeout(timer);
  }, [photos, index]);
}
