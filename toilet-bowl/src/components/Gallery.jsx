import { useEffect, useState } from "react";
import { getImageItems } from "../utils/getImages.js";
import { getGalleryIndexPage, getRandomGalleryIndex } from "../utils/getGalleryIndex.js";
import ZoomablePhoto from "./ZoomablePhoto";
import usePreloadPhotos from "../utils/usePreloadPhotos";

export default function Gallery({
  folderName = "gallery",
  thumbFolderName = folderName,
  fullFolderName = folderName,
  timeline,
  allYears = false,
  padding, 
  title = "Gallery",
  emptyMessage = "No photos yet",
  initialCount = 10,
  loadMoreCount = 20,
  columns,
}) {
  const [allPhotos, setAllPhotos] = useState([]);
  const [visiblePhotos, setVisiblePhotos] = useState([]);
  const [count, setCount] = useState(initialCount);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [indexCursor, setIndexCursor] = useState(null);
  const [indexHasMore, setIndexHasMore] = useState(false);
  const [usingIndex, setUsingIndex] = useState(false);

  const isLightboxOpen = activeIndex !== null;
  const activePhoto = isLightboxOpen ? visiblePhotos[activeIndex] : null;
  usePreloadPhotos(visiblePhotos, activeIndex);

  useEffect(() => {
    async function loadGallery() {
      setAllPhotos([]);
      setVisiblePhotos([]);
      setCount(initialCount);
      setActiveIndex(null);
      setLoading(true);
      setLoadingMore(false);
      setIndexCursor(null);
      setIndexHasMore(false);
      setUsingIndex(false);

      if (allYears) {
        const photos = await getRandomGalleryIndex();
        setAllPhotos(photos);
        setVisiblePhotos(photos.slice(0, initialCount));
        setLoading(false);
        return;
      }

      if (timeline) {
        const indexedPage = await getGalleryIndexPage(timeline, initialCount);

        if (indexedPage.photos.length > 0) {
          setAllPhotos(indexedPage.photos);
          setVisiblePhotos(indexedPage.photos);
          setCount(indexedPage.photos.length);
          setIndexCursor(indexedPage.cursor);
          setIndexHasMore(indexedPage.hasMore);
          setUsingIndex(true);
          setLoading(false);
          return;
        }
      }

      const thumbItems = await getImageItems(thumbFolderName);
      const photos = thumbItems.map((item) => ({
        fileName: item.name,
        thumbUrl: item.url,
        fullPath: `${fullFolderName}/${item.name}`,
      }));
      const shuffled = photos.sort(() => Math.random() - 0.5);
      setAllPhotos(shuffled);
      setVisiblePhotos(shuffled.slice(0, initialCount));
      setLoading(false);
    }
    loadGallery();
  }, [thumbFolderName, fullFolderName, timeline, initialCount, allYears]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveIndex(null);
      }

      if (e.key === "ArrowLeft") {
        setActiveIndex((current) => {
          if (current === null) return current;
          return current === 0 ? visiblePhotos.length - 1 : current - 1;
        });
      }

      if (e.key === "ArrowRight") {
        setActiveIndex((current) => {
          if (current === null) return current;
          return current === visiblePhotos.length - 1 ? 0 : current + 1;
        });
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, visiblePhotos.length]);

  const loadMore = async () => {
    if (usingIndex) {
      setLoadingMore(true);

      const nextPage = await getGalleryIndexPage(
        timeline,
        loadMoreCount,
        indexCursor
      );

      setAllPhotos((current) => [...current, ...nextPage.photos]);
      setVisiblePhotos((current) => [...current, ...nextPage.photos]);
      setCount((current) => current + nextPage.photos.length);
      setIndexCursor(nextPage.cursor);
      setIndexHasMore(nextPage.hasMore);
      setLoadingMore(false);
      return;
    }

    const newCount = count + loadMoreCount;
    setCount(newCount);
    setVisiblePhotos(allPhotos.slice(0, newCount));
  };

  const showPrevious = () => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === 0 ? visiblePhotos.length - 1 : current - 1;
    });
  };

  const showNext = () => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === visiblePhotos.length - 1 ? 0 : current + 1;
    });
  };

  const closeLightbox = () => {
    setActiveIndex(null);
  };

  return (
    <section id="gallery" className={`gallery ${padding || ""}${columns ? " gallery-columns" : ""}`} style={columns ? { "--gallery-columns": columns } : undefined}>
      <h2>{title}</h2>
      {loading && (
        <div className="grid loading-grid" aria-label="Loading gallery photos">
          {Array.from({ length: Math.min(initialCount, 12) }).map((_, idx) => (
            <div className="gallery-placeholder" key={idx}>
              <span className="photo-loader" />
            </div>
          ))}
        </div>
      )}

      {!loading && visiblePhotos.length === 0 && (
        <p className="empty-gallery">{emptyMessage}</p>
      )}

      {!loading && (
      <div className="grid">
        {visiblePhotos.map((url, idx) => (
          <button
            className="gallery-thumb"
            key={url.thumbUrl}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Open Toilet Bowl photo ${idx + 1}`}
          >
            <img
              src={url.thumbUrl}
              alt={`Toilet Bowl ${idx + 1}`}
              loading="lazy"
            />
          </button>
        ))}
      </div>
      )}

      {((usingIndex && indexHasMore) || visiblePhotos.length < allPhotos.length) && (
        <button className="load-more" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? "Loading..." : "Load More"}
        </button>
      )}

      {isLightboxOpen && activePhoto && (
        <div className="gallery-lightbox" onClick={closeLightbox}>
          <div className="lightbox-topbar">
            <span>
              Photo {activeIndex + 1} of {visiblePhotos.length}
            </span>
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close photo">
              x
            </button>
          </div>

          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              showPrevious();
            }}
            aria-label="Previous photo"
          >
            &lt;
          </button>

          <ZoomablePhoto
            photoKey={activePhoto.id || activePhoto.fullPath || activeIndex}
            src={activePhoto.fullUrl}
            fullPath={activePhoto.fullPath}
            fallbackSrc={activePhoto.thumbUrl}
            alt={`Toilet Bowl photo ${activeIndex + 1}`}
            onPrevious={showPrevious}
            onNext={showNext}
          />

          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label="Next photo"
          >
            &gt;
          </button>
        </div>
      )}
    </section>
  );
}
