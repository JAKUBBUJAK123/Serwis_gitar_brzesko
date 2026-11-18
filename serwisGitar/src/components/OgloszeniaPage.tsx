import { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import AdminPanel from "./AdminComponent";
import type { Ogloszenie } from "../types/Ogloszenia";
import { apiFetch } from "../utils/api";
import "../styles/mainStyle.css";

function OgloszeniaPage() {
  const [ogloszenia, setOgloszenia] = useState<Ogloszenie[]>([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [blad, setBlad] = useState<string | null>(null);

  const pobierzOgloszenia = useCallback(() => {
    setLadowanie(true);
    apiFetch("/ogloszenia")
      .then((res) => {
        if (!res.ok) throw new Error("Błąd pobierania danych");
        return res.json();
      })
      .then((dane) => {
        setOgloszenia(dane);
        setBlad(null);
        setLadowanie(false);
      })
      .catch((err) => {
        setBlad(err.message);
        setLadowanie(false);
      });
  }, []);

  useEffect(() => {
    pobierzOgloszenia();
    function handleOgloszeniaZmienione(e: Event) {
      const customEvent = e as CustomEvent<Ogloszenie[]>;
      if (Array.isArray(customEvent.detail)) {
        setOgloszenia(customEvent.detail);
      } else {
        pobierzOgloszenia();
      }
    }
    window.addEventListener("ogloszenia-zmienione", handleOgloszeniaZmienione);
    return () =>
      window.removeEventListener(
        "ogloszenia-zmienione",
        handleOgloszeniaZmienione,
      );
  }, [pobierzOgloszenia]);

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

        {ladowanie && <p>Ładowanie ogłoszeń...</p>}
        {blad && (
          <p className="status-brak">Nie udało się pobrać danych: {blad}</p>
        )}

        {!ladowanie && !blad && (
          <div className="ogloszenia-grid">
            {ogloszenia.map((o) => (
              <a
                key={o.id}
                href={o.link}
                target="_blank"
                rel="noopener noreferrer"
                className="ogloszenie-karta"
              >
                <div className="ogloszenie-img-wrap">
                  <img src={o.img} alt="Ogłoszenie" loading="lazy" />
                </div>
                <div className="ogloszenie-stopka">
                  <span className="ogloszenie-cta">
                    Przejdź do ogłoszenia ↗
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
      <footer>© {new Date().getFullYear()} Gitarowy kącik</footer>
    </div>
  );
}

export default OgloszeniaPage;
