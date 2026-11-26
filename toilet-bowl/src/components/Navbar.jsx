import { useEffect, useRef, useState } from "react";
import logo from "/tb3.png";

const Navbar = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const toggleButton = useRef(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleButton.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

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
      {open && <button className="menu-backdrop" aria-label="Close menu" tabIndex={-1} onClick={() => setOpen(false)} />}
      <div id="site-menu" className={`menu ${open ? "open" : ""}`} inert={!open}>
        <button onClick={() => scrollTo("about")}>About</button>
        <button onClick={() => scrollTo("details")}>Details</button>
        <button
          onClick={() => {
            onNavigate("/gallery");
            setOpen(false);
          }}
        >
          Gallery
        </button>
        <button onClick={() => {
          onNavigate("/rules");
          setOpen(false);
        }}>Rules</button>
        <button onClick={() => {
          onNavigate("/winners");
          setOpen(false);
        }}>The Record Book</button>
        <button onClick={() => {
          onNavigate("/shop");
          setOpen(false);
        }}>Shop</button>
        <button
          onClick={() => {
            onNavigate("/upload");
            setOpen(false);
          }}
        >
          Upload Photos
        </button>
        <button className="admin-menu-button" aria-label="Open admin page" title="Admin" onClick={() => {
          onNavigate("/admin");
          setOpen(false);
        }}>
          <img src={logo} alt="" />
        </button>
      </div>
      <button
        className="hamburger"
        ref={toggleButton}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="site-menu"
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
};

export default Navbar;
