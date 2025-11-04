// src/components/Gallery.jsx
import { useEffect, useState } from "react";
import { getImages } from "../utils/getImages.js";

export default function Gallery() {
  const [allPhotos, setAllPhotos] = useState([]);
  const [visiblePhotos, setVisiblePhotos] = useState([]);
  const [count, setCount] = useState(10);

  useEffect(() => {
    async function loadGallery() {
      const urls = await getImages("gallery");
      const shuffled = urls.sort(() => Math.random() - 0.5);
      setAllPhotos(shuffled);
      setVisiblePhotos(shuffled.slice(0, 10));
    }
    loadGallery();
  }, []);

  const loadMore = () => {
    const newCount = count + 20;
    setCount(newCount);
    setVisiblePhotos(allPhotos.slice(0, newCount));
  };

  return (
    <section id="gallery" className="gallery">
      <h2>Gallery</h2>
      <div className="grid">
        {visiblePhotos.map((url, idx) => (
          <img key={idx} src={url} alt={`Toilet Bowl ${idx}`} />
        ))}
      </div>

      {visiblePhotos.length < allPhotos.length && (
        <button className="load-more" onClick={loadMore}>
          Load More
        </button>
      )}
    </section>
  );
}
