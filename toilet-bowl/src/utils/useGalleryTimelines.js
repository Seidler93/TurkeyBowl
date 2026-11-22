import { useEffect, useMemo, useState } from "react";
import { galleryTimelines, getLatestGalleryYear } from "./galleryTimelines.js";

export default function useGalleryTimelines() {
  const [latestYear, setLatestYear] = useState(getLatestGalleryYear);
  useEffect(() => {
    const refresh = () => setLatestYear(getLatestGalleryYear());
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return useMemo(() => galleryTimelines(latestYear), [latestYear]);
}
