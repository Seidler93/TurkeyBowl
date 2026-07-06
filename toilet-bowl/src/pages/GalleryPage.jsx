import { useState } from "react";
import Gallery from "../components/Gallery";

const yearOptions = [
  {
    label: "The Past",
    timeline: "The Past",
    thumbFolderName: "gallery-thumbs/past",
    fullFolderName: "gallery-full/past",
  },
  {
    label: "2024",
    timeline: "2024",
    thumbFolderName: "gallery-thumbs/2024",
    fullFolderName: "gallery-full/2024",
  },
  {
    label: "2025",
    timeline: "2025",
    thumbFolderName: "gallery-thumbs/2025",
    fullFolderName: "gallery-full/2025",
  },
];

export default function GalleryPage() {
  const [selectedYear, setSelectedYear] = useState(yearOptions[0].label);
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
      />
    </>
  );
}
