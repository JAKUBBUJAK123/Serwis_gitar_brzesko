import { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import AdminComponent from "./AdminComponent";
import "../styles/galeriaStyle.css";
import { pobierzZdjeciaObiektu, type Zdjecie } from "../types/Zdjecia";

function GaleriaPage() {
  const [zdjecia, setZdjecia] = useState<Zdjecie[]>([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [blad, setBlad] = useState<string | null>(null);
  const [podglad, setPodglad] = useState<Zdjecie | null>(null);
  const [aktywneZdjecieIdx, setAktywneZdjecieIdx] = useState(0);

  const pobierzGalerie = useCallback(() => {
    setLadowanie(true);
    fetch(`${import.meta.env.VITE_API_URL}/galeria`)
      .then((res) => {
        if (!res.ok) throw new Error("Błąd pobierania danych");
        return res.json();
      })
      .then((dane) => {
        setZdjecia(dane);
        setBlad(null);
        setLadowanie(false);
      })
      .catch((err) => {
        setBlad(err.message);
        setLadowanie(false);
      });
  }, []);

  useEffect(() => {
    pobierzGalerie();
    function handleGaleriaZmieniona(e: Event) {
      const customEvent = e as CustomEvent<Zdjecie[]>;
      if (Array.isArray(customEvent.detail)) {
        setZdjecia(customEvent.detail);
      } else {
        pobierzGalerie();
      }
    }
    window.addEventListener("galeria-zmieniona", handleGaleriaZmieniona);
    return () =>
      window.removeEventListener("galeria-zmieniona", handleGaleriaZmieniona);
  }, [pobierzGalerie]);

  const zdjeciaWPodgladzie = podglad ? pobierzZdjeciaObiektu(podglad) : [];

  function otworzPodglad(obiekt: Zdjecie) {
    setPodglad(obiekt);
    setAktywneZdjecieIdx(0);
  }

  function zamknijPodglad() {
    setPodglad(null);
    setAktywneZdjecieIdx(0);
  }

  const poprzednieZdjecie = useCallback(() => {
    if (zdjeciaWPodgladzie.length <= 1) return;
    setAktywneZdjecieIdx((prev) =>
      prev === 0 ? zdjeciaWPodgladzie.length - 1 : prev - 1,
    );
  }, [zdjeciaWPodgladzie.length]);

  const nastepneZdjecie = useCallback(() => {
    if (zdjeciaWPodgladzie.length <= 1) return;
    setAktywneZdjecieIdx((prev) =>
      prev === zdjeciaWPodgladzie.length - 1 ? 0 : prev + 1,
    );
  }, [zdjeciaWPodgladzie.length]);

  useEffect(() => {
    if (!podglad) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") zamknijPodglad();
      if (e.key === "ArrowLeft") poprzednieZdjecie();
      if (e.key === "ArrowRight") nastepneZdjecie();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [podglad, poprzednieZdjecie, nastepneZdjecie]);

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
            {zdjecia.map((z: Zdjecie) => {
              const lista = pobierzZdjeciaObiektu(z);
              const okladka = lista[0] || "";
              return (
                <button
                  key={z.id}
                  className="galeria-kafelek"
                  onClick={() => otworzPodglad(z)}
                  aria-label={`Pokaż zdjęcia: ${z.opis}`}
                >
                  <img src={okladka} alt={z.opis} loading="lazy" />
                  <span className="galeria-podpis">{z.opis}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {podglad && zdjeciaWPodgladzie.length > 0 && (
        <div className="galeria-lightbox" onClick={zamknijPodglad}>
          <button
            className="galeria-zamknij"
            onClick={zamknijPodglad}
            aria-label="Zamknij podgląd"
          >
            ✕
          </button>

          <div
            className="galeria-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="galeria-lightbox-main">
              {zdjeciaWPodgladzie.length > 1 && (
                <button
                  type="button"
                  className="galeria-nawigacja prev"
                  onClick={poprzednieZdjecie}
                  aria-label="Poprzednie zdjęcie"
                >
                  ‹
                </button>
              )}

              <img
                src={zdjeciaWPodgladzie[aktywneZdjecieIdx]}
                alt={`${podglad.opis} - zdjęcie ${aktywneZdjecieIdx + 1}`}
              />

              {zdjeciaWPodgladzie.length > 1 && (
                <button
                  type="button"
                  className="galeria-nawigacja next"
                  onClick={nastepneZdjecie}
                  aria-label="Następne zdjęcie"
                >
                  ›
                </button>
              )}
            </div>

            <div className="galeria-lightbox-info">
              <p className="galeria-lightbox-opis">{podglad.opis}</p>
              {zdjeciaWPodgladzie.length > 1 && (
                <span className="galeria-lightbox-licznik">
                  Zdjęcie {aktywneZdjecieIdx + 1} z {zdjeciaWPodgladzie.length}
                </span>
              )}
            </div>

            {zdjeciaWPodgladzie.length > 1 && (
              <div className="galeria-lightbox-miniaturki">
                {zdjeciaWPodgladzie.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={
                      "galeria-miniaturka-btn" +
                      (idx === aktywneZdjecieIdx ? " aktywna" : "")
                    }
                    onClick={() => setAktywneZdjecieIdx(idx)}
                    aria-label={`Pokaż zdjęcie ${idx + 1}`}
                  >
                    <img
                      src={url}
                      alt={`${podglad.opis} miniatura ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <footer>© {new Date().getFullYear()} Gitarowy kącik</footer>
    </div>
  );
}

export default GaleriaPage;
