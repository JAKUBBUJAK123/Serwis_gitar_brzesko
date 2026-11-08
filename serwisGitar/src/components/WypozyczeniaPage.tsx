import { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import AdminPanel from "./AdminComponent";
import {
  pobierzZdjeciaWypozyczenia,
  type Wypozyczenie,
} from "../types/Wypozyczenia";
import "../styles/mainStyle.css";

function WypozyczeniaPage() {
  const [wypozyczenia, setWypozyczenia] = useState<Wypozyczenie[]>([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [blad, setBlad] = useState<string | null>(null);
  const [wybrany, setWybrany] = useState<Wypozyczenie | null>(null);
  const [aktywneZdjecieIdx, setAktywneZdjecieIdx] = useState(0);

  const pobierzDane = useCallback(() => {
    setLadowanie(true);
    fetch(`${import.meta.env.VITE_API_URL}/wypozyczenia`)
      .then((res) => {
        if (!res.ok) throw new Error("Błąd pobierania danych");
        return res.json();
      })
      .then((dane) => {
        setWypozyczenia(dane);
        setBlad(null);
        setLadowanie(false);
      })
      .catch((err) => {
        setBlad(err.message);
        setLadowanie(false);
      });
  }, []);

  useEffect(() => {
    pobierzDane();
    function handleWypozyczeniaZmienione(e: Event) {
      const customEvent = e as CustomEvent<Wypozyczenie[]>;
      if (Array.isArray(customEvent.detail)) {
        setWypozyczenia(customEvent.detail);
      } else {
        pobierzDane();
      }
    }
    window.addEventListener(
      "wypozyczenia-zmienione",
      handleWypozyczeniaZmienione,
    );
    return () =>
      window.removeEventListener(
        "wypozyczenia-zmienione",
        handleWypozyczeniaZmienione,
      );
  }, [pobierzDane]);

  const zdjeciaWybranego = wybrany ? pobierzZdjeciaWypozyczenia(wybrany) : [];

  function otworzPopup(produkt: Wypozyczenie) {
    setWybrany(produkt);
    setAktywneZdjecieIdx(0);
  }

  function zamknijPopup() {
    setWybrany(null);
    setAktywneZdjecieIdx(0);
  }

  const poprzednieZdjecie = useCallback(() => {
    if (zdjeciaWybranego.length <= 1) return;
    setAktywneZdjecieIdx((prev) =>
      prev === 0 ? zdjeciaWybranego.length - 1 : prev - 1,
    );
  }, [zdjeciaWybranego.length]);

  const nastepneZdjecie = useCallback(() => {
    if (zdjeciaWybranego.length <= 1) return;
    setAktywneZdjecieIdx((prev) =>
      prev === zdjeciaWybranego.length - 1 ? 0 : prev + 1,
    );
  }, [zdjeciaWybranego.length]);

  useEffect(() => {
    if (!wybrany) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") zamknijPopup();
      if (e.key === "ArrowLeft") poprzednieZdjecie();
      if (e.key === "ArrowRight") nastepneZdjecie();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [wybrany, poprzednieZdjecie, nastepneZdjecie]);

  return (
    <div className="luthier-page">
      <Navbar />
      <AdminPanel />
      <section id="wypożyczenia" className="section wypozyczenia">
        <h2>Wypożyczenia</h2>
        <p className="section-lead">
          Lorem ipsum dolor sit amet — poniżej przykładowa lista instrumentów
          dostępnych do wypożyczenia.
        </p>
        {ladowanie && <p>Ładowanie danych...</p>}
        {blad && (
          <p className="status-brak">Nie udało się pobrać danych: {blad}</p>
        )}
        {!ladowanie && !blad && (
          <div className="tableScroll">
            <table className="wypozyczenia-tabela">
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th></th>
                  <th>Dostępność</th>
                </tr>
              </thead>
              <tbody>
                {wypozyczenia.map((g) => {
                  const listaZdjec = pobierzZdjeciaWypozyczenia(g);
                  const okladka = listaZdjec[0] || "";
                  return (
                    <tr
                      key={g.id}
                      onClick={() => otworzPopup(g)}
                      className="wypozyczenia-row"
                    >
                      <td>{g.nazwa}</td>
                      <td>
                        <div className="wypozyczenia-img-wrap">
                          <img
                            src={okladka}
                            alt={g.nazwa}
                            className="wypozyczenia-img"
                          />
                        </div>
                      </td>
                      <td>
                        <span
                          className={
                            "status-badge " +
                            (g.dostepnosc === "Dostępna"
                              ? "status-ok"
                              : "status-brak")
                          }
                        >
                          {g.dostepnosc}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {wybrany && (
        <div className="modal-overlay" onClick={zamknijPopup}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={zamknijPopup}
              aria-label="Zamknij"
            >
              ×
            </button>

            {zdjeciaWybranego.length > 0 && (
              <div className="modal-galeria">
                <div className="modal-img-container">
                  {zdjeciaWybranego.length > 1 && (
                    <button
                      type="button"
                      className="modal-nawigacja prev"
                      onClick={poprzednieZdjecie}
                      aria-label="Poprzednie zdjęcie"
                    >
                      ‹
                    </button>
                  )}

                  <img
                    src={zdjeciaWybranego[aktywneZdjecieIdx]}
                    alt={`${wybrany.nazwa} - zdjęcie ${aktywneZdjecieIdx + 1}`}
                    className="modal-img"
                  />

                  {zdjeciaWybranego.length > 1 && (
                    <button
                      type="button"
                      className="modal-nawigacja next"
                      onClick={nastepneZdjecie}
                      aria-label="Następne zdjęcie"
                    >
                      ›
                    </button>
                  )}
                </div>

                {zdjeciaWybranego.length > 1 && (
                  <div className="modal-miniaturki">
                    {zdjeciaWybranego.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={
                          "modal-miniaturka-btn" +
                          (idx === aktywneZdjecieIdx ? " aktywna" : "")
                        }
                        onClick={() => setAktywneZdjecieIdx(idx)}
                        aria-label={`Pokaż zdjęcie ${idx + 1}`}
                      >
                        <img
                          src={url}
                          alt={`${wybrany.nazwa} miniatura ${idx + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="modal-body">
              <div className="modal-header-row">
                <h3>{wybrany.nazwa}</h3>
                <span
                  className={
                    "status-badge " +
                    (wybrany.dostepnosc === "Dostępna"
                      ? "status-ok"
                      : "status-brak")
                  }
                >
                  {wybrany.dostepnosc}
                </span>
              </div>
              <p className="modal-opis">
                {wybrany.opis || "Brak opisu dla tego produktu."}
              </p>
            </div>
          </div>
        </div>
      )}

      <footer>© {new Date().getFullYear()} Gitarowy kącik</footer>
    </div>
  );
}

export default WypozyczeniaPage;
