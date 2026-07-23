import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import AdminComponent from "./AdminComponent";
import "../styles/galeriaStyle.css";

function GaleriaPage() {
  const [zdjecia, setZdjecia] = useState([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [blad, setBlad] = useState(null);
  const [podglad, setPodglad] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/galeria`)
      .then((res) => {
        if (!res.ok) throw new Error("Błąd pobierania danych");
        return res.json();
      })
      .then((dane) => {
        setZdjecia(dane);
        setLadowanie(false);
      })
      .catch((err) => {
        setBlad(err.message);
        setLadowanie(false);
      });
  }, []);

  return (
    <div className="luthier-page">
      <Navbar />
      <AdminComponent />
      <section className="section galeria">
        <h2>Galeria zdjęć</h2>
        <p className="section-lead">
          Kilka ujęć z naszego warsztatu i zrealizowanych napraw.
        </p>

        {ladowanie && <p>Ładowanie danych...</p>}
        {blad && (
          <p className="status-brak">Nie udało się pobrać danych: {blad}</p>
        )}

        {!ladowanie && !blad && (
          <div className="galeria-grid">
            {zdjecia.map((z) => (
              <button
                key={z.id}
                className="galeria-kafelek"
                onClick={() => setPodglad(z)}
                aria-label={`Powiększ zdjęcie: ${z.opis}`}
              >
                <img src={z.src} alt={z.opis} loading="lazy" />
                <span className="galeria-podpis">{z.opis}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {podglad && (
        <div className="galeria-lightbox" onClick={() => setPodglad(null)}>
          <button
            className="galeria-zamknij"
            onClick={() => setPodglad(null)}
            aria-label="Zamknij podgląd"
          >
            ✕
          </button>
          <img src={podglad.src} alt={podglad.opis} />
          <p>{podglad.opis}</p>
        </div>
      )}

      <footer>© {new Date().getFullYear()} Gitarowy kącik</footer>
    </div>
  );
}

export default GaleriaPage;
