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
import GalleryPage from "./pages/GalleryPage";
import UploadPhotosPage from "./pages/UploadPhotosPage";
import PlayersPage from "./pages/PlayersPage";
import "./styles/main.css";

const customPages = {
  "/gallery": GalleryPage,
  "/upload": UploadPhotosPage,
  "/players": PlayersPage,
};

function getPath() {
  return window.location.pathname;
}

function App() {
  const [showRSVP, setShowRSVP] = useState(false);
  const [path, setPath] = useState(getPath);

  const navigate = (nextPath) => {
    window.history.pushState({}, "", nextPath);
    setPath(getPath());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handlePopState = () => {
      setPath(getPath());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (showRSVP) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showRSVP]);

  const CustomPage = customPages[path];

  if (CustomPage) {
    return (
      <>
        <Navbar onNavigate={navigate} />
        <main className="page-shell">
          <CustomPage />
        </main>
        <footer className="footer">Copyright 2026 Toilet Bowl - Built by AJ</footer>
        {showRSVP && <RSVPForm onClose={() => setShowRSVP(false)} />}
      </>
    );
  }

  return (
    <>
      <Navbar onNavigate={navigate} />
      <Hero onRSVPClick={() => setShowRSVP(true)} />
      <About />
      <Details />
      <KickoffTimer />
      <Forecast />
      <Events />
      <Gallery
        timeline="2024"
        thumbFolderName="gallery-thumbs/2024"
        fullFolderName="gallery-full/2024"
        padding="fix"
      />
      <Rules />
      <PreviousWinners />
      <Attendance />
      <footer className="footer">Copyright 2026 Toilet Bowl - Built by AJ</footer>
      {showRSVP && <RSVPForm onClose={() => setShowRSVP(false)} />}
    </>
  );
}

export default App;
