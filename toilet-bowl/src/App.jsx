import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Gallery from "./components/Gallery";
import Rules from "./components/Rules";
import "./styles/main.css";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Gallery />
      <Rules />
      <footer className="footer">© 2025 Toilet Bowl — Built by AJ 🏈</footer>
    </>
  );
}

export default App;
