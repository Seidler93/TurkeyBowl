import PreviousWinners from "../components/PreviousWinners";

export default function WinnersPage() {
  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Toilet Bowl Record</p>
        <h1>Previous Winners</h1>
      </div>
      <PreviousWinners showHeading={false} />
    </>
  );
}
