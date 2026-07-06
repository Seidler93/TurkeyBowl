import { useState } from "react";
import logo from "/tb3.png";

const Navbar = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);

  const scrollTo = (id) => {
    if (window.location.pathname !== "/") {
      onNavigate("/");
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }

    setOpen(false);
  };

  return (
    <nav className="navbar">
      <button className="nav-left" onClick={() => scrollTo("rsvp")}>
        <img src={logo} alt="Toilet Bowl Logo" className="nav-logo" />
        <span className="nav-title">Toilet Bowl</span>
      </button>
      <div className={`menu ${open ? "open" : ""}`}>
        <button onClick={() => scrollTo("about")}>About</button>
        <button onClick={() => scrollTo("details")}>Details</button>
        <button onClick={() => scrollTo("events")}>Events</button>
        <button
          onClick={() => {
            onNavigate("/gallery");
            setOpen(false);
          }}
        >
          Gallery
        </button>
        <button onClick={() => scrollTo("rules")}>Rules</button>
        <button onClick={() => scrollTo("winners")}>Record</button>
        <button onClick={() => scrollTo("attendance")}>Attendance</button>
        <button
          onClick={() => {
            onNavigate("/players");
            setOpen(false);
          }}
        >
          Players
        </button>
        <button
          onClick={() => {
            onNavigate("/upload");
            setOpen(false);
          }}
        >
          Upload Photos
        </button>
      </div>
      <button
        className="hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
};

export default Navbar;
