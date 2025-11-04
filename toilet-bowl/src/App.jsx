import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Gallery from "./components/Gallery";
import Rules from "./components/Rules";
import RSVPForm from "./components/RSVPForm";
import Attendance from "./components/Attendance";
import PreviousWinners from "./components/PreviousWinners";
import KickoffTimer from "./components/KickoffTimer";
import Events from "./components/Events";
import Forecast from "./components/Forecast";
import Details from "./components/Details";
import "./styles/main.css";

function App() {
  const [showRSVP, setShowRSVP] = useState(false);

  useEffect(() => {
    if (showRSVP) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup just in case component unmounts while modal open
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showRSVP]);

  return (
    <>
      <Navbar />
      <Hero onRSVPClick={() => setShowRSVP(true)} />
      <About />
      <Details /> 
      <KickoffTimer />
      <Forecast />
      <Events /> 
      <Gallery />
      <Rules />
      <PreviousWinners />
      <Attendance />
      <footer className="footer">© 2025 Toilet Bowl — Built by AJ 🏈</footer>
      {/* Modal placed globally so it covers EVERYTHING */}
      {showRSVP && <RSVPForm onClose={() => setShowRSVP(false)} />}
    </>
  );
}

export default App;
