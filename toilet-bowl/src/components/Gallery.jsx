import { useEffect, useState } from "react";
import { getImageItems, getImageUrl } from "../utils/getImages.js";
import { getGalleryIndex } from "../utils/getGalleryIndex.js";

export default function Gallery({
  folderName = "gallery",
  thumbFolderName = folderName,
  fullFolderName = folderName,
  timeline,
  padding, 
  title = "Gallery",
  emptyMessage = "No photos yet",
  initialCount = 10,
}) {
  const [allPhotos, setAllPhotos] = useState([]);
  const [visiblePhotos, setVisiblePhotos] = useState([]);
  const [count, setCount] = useState(initialCount);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFullUrl, setActiveFullUrl] = useState("");
  const [fullLoading, setFullLoading] = useState(false);

  const isLightboxOpen = activeIndex !== null;
  const activePhoto = isLightboxOpen ? visiblePhotos[activeIndex] : null;

  useEffect(() => {
    async function loadGallery() {
      setAllPhotos([]);
      setVisiblePhotos([]);
      setCount(initialCount);
      setActiveIndex(null);
      setLoading(true);
      setActiveFullUrl("");
      setFullLoading(false);

      if (timeline) {
        const indexedPhotos = await getGalleryIndex(timeline, initialCount);

        if (indexedPhotos.length > 0) {
          setAllPhotos(indexedPhotos);
          setVisiblePhotos(indexedPhotos);
          setCount(indexedPhotos.length);
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
  }, [thumbFolderName, fullFolderName, timeline, initialCount]);

  useEffect(() => {
    if (!activePhoto) {
      setActiveFullUrl("");
      setFullLoading(false);
      return;
    }

    let cancelled = false;
    setActiveFullUrl("");
    setFullLoading(true);

    if (activePhoto.fullUrl) {
      setActiveFullUrl(activePhoto.fullUrl);
      setFullLoading(false);
      return;
    }

    getImageUrl(activePhoto.fullPath)
      .then((url) => {
        if (!cancelled) {
          setActiveFullUrl(url);
        }
      })
      .catch((error) => {
        console.warn("Falling back to thumbnail for lightbox image:", error);
        if (!cancelled) {
          setActiveFullUrl(activePhoto.thumbUrl);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setFullLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activePhoto]);

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

  const loadMore = () => {
    const newCount = count + 20;
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
    <section id="gallery" className={`gallery ${padding}`}>
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

      {visiblePhotos.length < allPhotos.length && (
        <button className="load-more" onClick={loadMore}>
          Load More
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

          <img
            className="lightbox-image"
            src={activeFullUrl || activePhoto.thumbUrl}
            alt={`Toilet Bowl photo ${activeIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
          />

          {fullLoading && (
            <div className="lightbox-loading">
              <span className="photo-loader" />
            </div>
          )}

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
