// import { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import AdminPanel from "./AdminComponent";
import "../styles/mainStyle.css";

function OgloszeniaPage() {
  return (
    <div className="luthier-page">
      <Navbar />
      <AdminPanel />
      <section id="ogloszenia" className="section ogloszenia">
        <h2>Ogłoszenia parafialne</h2>
        <p className="section-lead">
          W tej sekcji znajdą Państwo przekierowania do naszych aktualnych ofert
          sprzedaży. Publikujemy tam ogłoszenia dotyczące gitar, części oraz
          sprzętu muzycznego. Zachęcamy do regularnego zaglądania – oferta może
          się zmieniać i pojawiać mogą się nowe, interesujące pozycje.
        </p>
      </section>
      <footer>© {new Date().getFullYear()} Gitarowy kącik</footer>
    </div>
  );
}

export default OgloszeniaPage;
