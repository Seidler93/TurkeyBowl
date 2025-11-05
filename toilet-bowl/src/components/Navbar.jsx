import { useState } from "react";
import logo from "/tb3.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-left" onClick={() => scrollTo("rsvp")}>
        <img src={logo} alt="Toilet Bowl Logo" className="nav-logo" />
        <span className="nav-title">Toilet Bowl</span>
      </div>      
      <div className={`menu ${open ? "open" : ""}`}>
        <button onClick={() => scrollTo("about")}>About</button>
        <button onClick={() => scrollTo("details")}>Details</button>
        <button onClick={() => scrollTo("events")}>Events</button>
        <button onClick={() => scrollTo("gallery")}>Gallery</button>
        <button onClick={() => scrollTo("rules")}>Rules</button>
        <button onClick={() => scrollTo("winners")}>Record</button>
        <button onClick={() => scrollTo("attendance")}>Attendance</button>
      </div>
      <div className="hamburger" onClick={() => setOpen(!open)}>
        <span />
        <span />
        <span />
      </div>
    </nav>
  );
};

export default Navbar;
