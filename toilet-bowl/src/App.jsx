import { useState, useEffect, useLayoutEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Gallery from "./components/Gallery";
import RSVPForm from "./components/RSVPForm";
import Attendance from "./components/Attendance";
import PreviousWinners from "./components/PreviousWinners";
import KickoffTimer from "./components/KickoffTimer";
import Events from "./components/Events";
import Forecast from "./components/Forecast";
import Details from "./components/Details";
import GalleryPage from "./pages/GalleryPage";
import UploadPhotosPage from "./pages/UploadPhotosPage";
import WinnersPage from "./pages/WinnersPage";
import RulesPage from "./pages/RulesPage";
import AdminPage from "./pages/AdminPage";
import "./styles/main.css";

const customPages = {
  "/gallery": GalleryPage,
  "/upload": UploadPhotosPage,
  "/winners": WinnersPage,
  "/rules": RulesPage,
  "/admin": AdminPage,
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
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [path]);

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
      <PreviousWinners latestOnly onViewAll={() => navigate("/winners")} />
      <KickoffTimer />
      <Forecast />
      <Events />
      <Gallery
        allYears
        padding="fix"
      />
      <Attendance />
      <footer className="footer">Copyright 2026 Toilet Bowl - Built by AJ</footer>
      {showRSVP && <RSVPForm onClose={() => setShowRSVP(false)} />}
    </>
  );
}

export default App;
