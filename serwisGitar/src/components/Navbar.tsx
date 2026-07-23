import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [otwarte, setOtwarte] = useState(false);

  function zamknijMenu() {
    setOtwarte(false);
  }

  return (
    <nav className="navbar">
      <div className="brand">
        <div className="logo" aria-hidden="true">
          <img src="./src/assets/imgs/guitar_logo.png" alt="Gitarowy kącik" />
        </div>
        Gitarowy kącik
      </div>

      <button
        className={`hamburger ${otwarte ? "aktywny" : ""}`}
        onClick={() => setOtwarte(!otwarte)}
        aria-label={otwarte ? "Zamknij menu" : "Otwórz menu"}
        aria-expanded={otwarte}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`nav-links ${otwarte ? "otwarte" : ""}`}>
        <li>
          <Link to="/#o-nas" onClick={zamknijMenu}>
            O nas
          </Link>
        </li>
        <li>
          <Link to="/#produkty" onClick={zamknijMenu}>
            Produkty
          </Link>
        </li>
        <li>
          <Link to="/galeria" onClick={zamknijMenu}>
            galeria zdjęć
          </Link>
        </li>
        <li>
          <Link to="/wypozyczenia" onClick={zamknijMenu}>
            Wypożyczenia
          </Link>
        </li>
        <li>
          <Link to="/#kontakt" onClick={zamknijMenu}>
            Kontakt
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
