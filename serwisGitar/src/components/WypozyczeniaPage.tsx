import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import AdminPanel from "./AdminComponent";
import "../styles/mainStyle.css";

function WypozyczeniaPage() {
  const [wypozyczenia, setWypozyczenia] = useState([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [blad, setBlad] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/wypozyczenia`)
      .then((res) => {
        if (!res.ok) throw new Error("Błąd pobierania danych");
        return res.json();
      })
      .then((dane) => {
        setWypozyczenia(dane);
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
          <table className="wypozyczenia-tabela">
            <thead>
              <tr>
                <th>Produkt</th>
                <th></th>
                <th>Dostępność</th>
              </tr>
            </thead>
            <tbody>
              {wypozyczenia.map((g) => (
                <tr key={g.id}>
                  <td>{g.nazwa}</td>
                  <td>
                    <img
                      src={g.img}
                      alt={g.nazwa}
                      className="wypozyczenia-img"
                    />
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
              ))}
            </tbody>
          </table>
        )}
      </section>
      <footer>© {new Date().getFullYear()} Gitarowy kącik</footer>
    </div>
  );
}

export default WypozyczeniaPage;
