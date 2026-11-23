import { useState } from "react";
import Gallery from "../components/Gallery";
import useGalleryTimelines from "../utils/useGalleryTimelines";

export default function GalleryPage() {
  const yearOptions = useGalleryTimelines();
  const [yearChoice, setSelectedYear] = useState(null);
  const [columns, setColumns] = useState(2);
  const selectedYear = yearChoice ?? yearOptions[0].label;
  const selectedOption = yearOptions.find((option) => option.label === selectedYear) || yearOptions[0];

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Toilet Bowl Gallery</p>
        <h1>Gallery</h1>
        <p>Pick a year and relive the catches, chaos, and sideline legends.</p>
      </div>

      <div className="gallery-toolbar gallery-page-toolbar">
        <div className="gallery-year-control">
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
        <div className="record-view-toggle gallery-column-toggle" role="group" aria-label="Gallery columns">
          {[1, 2, 3].map((count) => (
            <button type="button" key={count} aria-pressed={columns === count} aria-label={`${count} column${count === 1 ? "" : "s"}`} title={`${count} column${count === 1 ? "" : "s"}`} onClick={() => setColumns(count)}>{count}</button>
          ))}
        </div>
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
        columns={columns}
      />
    </>
  );
}
