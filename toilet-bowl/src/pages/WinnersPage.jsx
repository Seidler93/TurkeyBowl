import PreviousWinners from "../components/PreviousWinners";
import { useState } from "react";

export default function WinnersPage() {
  const [view, setView] = useState("gallery");
  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Toilet Bowl Record</p>
        <h1>The Record Book</h1>
      </div>
      <div className="record-view-toggle" role="group" aria-label="Record Book view">
        <button type="button" aria-pressed={view === "gallery"} onClick={() => setView("gallery")}>Gallery</button>
        <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}>Table</button>
      </div>
      <PreviousWinners showHeading={false} view={view} />
    </>
  );
}
