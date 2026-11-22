import Rules from "../components/Rules";

export default function RulesPage() {
  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Toilet Bowl</p>
        <h1>Rules of the Game</h1>
      </div>
      <Rules showHeading={false} />
    </>
  );
}
