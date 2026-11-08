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
          Lorem ipsum dolor sit amet — poniżej przykładowa lista instrumentów
          dostępnych do wypożyczenia.
        </p>
      </section>
      <footer>© {new Date().getFullYear()} Gitarowy kącik</footer>
    </div>
  );
}

export default OgloszeniaPage;
