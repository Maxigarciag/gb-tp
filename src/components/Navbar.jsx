import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css"; // Adjust the path as necessary

function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="logo-and-text">
        <img
          src="../src/assets/logo-azul-osc.png"
          alt="Get Big logo"
          className="app-logo"
        />
        <span className="app-name">Get Big</span>
      </div>
      <ul>
        <li>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
        </li>
        <li>
          <Link
            to="/about"
            className={location.pathname === "/about" ? "active" : ""}
          >
            <i className="fas fa-info-circle"></i>
            <span>About</span>
          </Link>
        </li>
        <li>
          <Link
            to="/rutina"
            className={location.pathname === "/rutina" ? "active" : ""}
          >
            <i className="fas fa-dumbbell"></i>
            <span>Rutina</span>
          </Link>
        </li>
        <li>
          <Link
            to="/contact"
            className={location.pathname === "/contact" ? "active" : ""}
          >
            <i className="fas fa-envelope"></i>
            <span>Contact</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
