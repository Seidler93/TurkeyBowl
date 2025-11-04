import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="logo">🏈 Toilet Bowl</div>
      <div className={`menu ${open ? "open" : ""}`}>
        <button onClick={() => scrollTo("about")}>About</button>
        <button onClick={() => scrollTo("gallery")}>Gallery</button>
        <button onClick={() => scrollTo("rules")}>Rules</button>
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
