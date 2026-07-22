import { Link } from 'react-router-dom'

function Navbar() {

    return (
            <nav className="navbar">
          <div className="brand">
            <div className="logo" aria-hidden="true">
                <img src="./src/assets/imgs/guitar_logo.png" alt="Gitarowy kącik"/>
                </div>
            Gitarowy kącik
          </div>
          <ul className="nav-links">
            <li><Link to="/">O nas</Link></li>
            <li><Link to="/">Produkty</Link></li>
            <li><Link to="/galeria">galeria zdjęć</Link></li>
            <li><Link to="/">Wypożyczenia</Link></li>
            <li><Link to="/">Kontakt</Link></li>
          </ul>
        </nav>
    )
}

export default Navbar