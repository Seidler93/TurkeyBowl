import { useState } from "react";
import Gallery from "../components/Gallery";
import useGalleryTimelines from "../utils/useGalleryTimelines";

export default function GalleryPage() {
  const yearOptions = useGalleryTimelines();
  const [yearChoice, setSelectedYear] = useState(null);
  const selectedYear = yearChoice ?? yearOptions[0].label;
  const selectedOption = yearOptions.find((option) => option.label === selectedYear) || yearOptions[0];

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Toilet Bowl Gallery</p>
        <h1>Gallery</h1>
        <p>Pick a year and relive the catches, chaos, and sideline legends.</p>
      </div>

      <div className="gallery-toolbar">
        <label htmlFor="gallery-year">Year</label>
        <select
          id="gallery-year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {yearOptions.map((option) => (
            <option key={option.label} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Gallery
        key={selectedOption.label}
        timeline={selectedOption.timeline}
        thumbFolderName={selectedOption.thumbFolderName}
        fullFolderName={selectedOption.fullFolderName}
        title={`${selectedOption.label} Gallery`}
        emptyMessage={`No photos have been added for ${selectedOption.label} yet.`}
        initialCount={50}
        loadMoreCount={50}
      />
    </>
  );
}
