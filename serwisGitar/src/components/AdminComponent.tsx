import { useState, useEffect } from "react";
import "../styles/adminStyle.css";
import type { Wypozyczenie } from "../types/Wypozyczenia";
import type { Zdjecie } from "../types/Zdjecia";

const ADMIN_HASLO = import.meta.env.VITE_ADMIN_HASLO || "gitara123";
const API_URL = import.meta.env.VITE_API_URL;

function AdminPanel() {
  const [pokazLogowanie, setPokazLogowanie] = useState(false);
  const [zalogowany, setZalogowany] = useState(false);
  const [haslo, setHaslo] = useState("");
  const [bladHasla, setBladHasla] = useState(false);
  const [zakladka, setZakladka] = useState("wypozyczenia");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setPokazLogowanie(true);
      }
      if (e.key === "Escape") zamknij();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleLogowanie(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (haslo === ADMIN_HASLO) {
      setZalogowany(true);
      setPokazLogowanie(false);
      setHaslo("");
      setBladHasla(false);
    } else {
      setBladHasla(true);
    }
  }

  function zamknij() {
    setPokazLogowanie(false);
    setZalogowany(false);
  }

  if (!pokazLogowanie && !zalogowany) return null;

  return (
    <div className="admin-overlay">
      {pokazLogowanie && !zalogowany && (
        <div className="admin-modal admin-login">
          <h3>Panel administratora</h3>
          <form onSubmit={handleLogowanie}>
            <label htmlFor="admin-haslo">Hasło</label>
            <input
              id="admin-haslo"
              type="password"
              autoFocus
              value={haslo}
              onChange={(e) => {
                setHaslo(e.target.value);
                setBladHasla(false);
              }}
            />
            {bladHasla && <p className="admin-blad">Nieprawidłowe hasło</p>}
            <div className="admin-akcje">
              <button type="submit">Zaloguj</button>
              <button type="button" onClick={() => setPokazLogowanie(false)}>
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {zalogowany && (
        <div className="admin-modal admin-panel">
          <div className="admin-naglowek">
            <h3>Panel administratora</h3>
            <button className="admin-zamknij" onClick={zamknij}>
              ✕
            </button>
          </div>

          <div className="admin-taby">
            <button
              className={zakladka === "wypozyczenia" ? "aktywna" : ""}
              onClick={() => setZakladka("wypozyczenia")}
            >
              Wypożyczenia
            </button>
            <button
              className={zakladka === "galeria" ? "aktywna" : ""}
              onClick={() => setZakladka("galeria")}
            >
              Galeria
            </button>
          </div>

          {zakladka === "wypozyczenia" ? (
            <PanelWypozyczenia />
          ) : (
            <PanelGaleria />
          )}
        </div>
      )}
    </div>
  );
}

// --- wspólna funkcja uploadu pliku, używana w obu zakładkach ---
async function wgrajPlik(plik: File): Promise<string> {
  const dane = new FormData();
  dane.append("plik", plik);
  const res = await fetch(`${API_URL}/upload`, { method: "POST", body: dane });
  if (!res.ok) throw new Error("Błąd uploadu pliku");
  const wynik = await res.json();
  return wynik.url;
}

function PanelWypozyczenia() {
  const [produkty, setProdukty] = useState<Wypozyczenie[]>([]);
  const [ladowanie, setLadowanie] = useState(false);
  const [edytowany, setEdytowany] = useState<Wypozyczenie | null>(null);
  const [nazwa, setNazwa] = useState("");
  const [dostepnosc, setDostepnosc] = useState("Dostępna");
  const [plik, setPlik] = useState<File | null>(null);
  const [wysylanie, setWysylanie] = useState(false);

  useEffect(() => {
    pobierz();
  }, []);

  function pobierz() {
    setLadowanie(true);
    fetch(`${API_URL}/wypozyczenia`)
      .then((res) => res.json())
      .then(setProdukty)
      .finally(() => setLadowanie(false));
  }

  function resetFormularza() {
    setEdytowany(null);
    setNazwa("");
    setDostepnosc("Dostępna");
    setPlik(null);
  }

  function handleEdytuj(produkt: Wypozyczenie) {
    setEdytowany(produkt);
    setNazwa(produkt.nazwa);
    setDostepnosc(produkt.dostepnosc);
    setPlik(null);
  }

  async function handleZapisz(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setWysylanie(true);
    try {
      let img = edytowany?.img;
      if (plik) img = await wgrajPlik(plik); // nowy plik nadpisuje stary URL

      const metoda = edytowany ? "PUT" : "POST";
      const url = edytowany
        ? `${API_URL}/wypozyczenia/${edytowany.id}`
        : `${API_URL}/wypozyczenia`;

      const res = await fetch(url, {
        method: metoda,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nazwa, dostepnosc, img }),
      });
      if (!res.ok) throw new Error();
      resetFormularza();
      pobierz();
    } catch {
      alert("Nie udało się zapisać zmian");
    } finally {
      setWysylanie(false);
    }
  }

  function handleUsun(id: string) {
    if (!confirm("Na pewno usunąć ten produkt?")) return;
    fetch(`${API_URL}/wypozyczenia/${id}`, { method: "DELETE" }).then(pobierz);
  }

  function handleZmienStatus(produkt: Wypozyczenie) {
    const nowyStatus =
      produkt.dostepnosc === "Dostępna" ? "Wypożyczona" : "Dostępna";
    fetch(`${API_URL}/wypozyczenia/${produkt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dostepnosc: nowyStatus }),
    }).then(pobierz);
  }

  return (
    <>
      <form className="admin-formularz" onSubmit={handleZapisz}>
        <input
          type="text"
          placeholder="Nazwa produktu"
          value={nazwa}
          onChange={(e) => setNazwa(e.target.value)}
          required
        />
        <select
          value={dostepnosc}
          onChange={(e) => setDostepnosc(e.target.value)}
        >
          <option value="Dostępna">Dostępna</option>
          <option value="Wypożyczona">Wypożyczona</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPlik(e.target.files[0])
          }
          required={!edytowany}
        />
        <button type="submit" disabled={wysylanie}>
          {wysylanie
            ? "Zapisywanie..."
            : edytowany
              ? "Zapisz zmiany"
              : "Dodaj produkt"}
        </button>
        {edytowany && (
          <button type="button" onClick={resetFormularza}>
            Anuluj edycję
          </button>
        )}
      </form>

      {ladowanie ? (
        <p>Ładowanie...</p>
      ) : (
        <table className="admin-tabela">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Status</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {produkty.map((p) => (
              <tr key={p.id}>
                <td>{p.nazwa}</td>
                <td>
                  <button
                    className="admin-status-toggle"
                    onClick={() => handleZmienStatus(p)}
                  >
                    {p.dostepnosc}
                  </button>
                </td>
                <td className="admin-akcje-kolumna">
                  <button onClick={() => handleEdytuj(p)}>Edytuj</button>
                  <button onClick={() => handleUsun(p.id)}>Usuń</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function PanelGaleria() {
  const [zdjecia, setZdjecia] = useState<Zdjecie[]>([]);
  const [ladowanie, setLadowanie] = useState(false);
  const [opis, setOpis] = useState("");
  const [plik, setPlik] = useState<File | null>(null);
  const [wysylanie, setWysylanie] = useState(false);

  useEffect(() => {
    pobierz();
  }, []);

  function pobierz() {
    setLadowanie(true);
    fetch(`${API_URL}/galeria`)
      .then((res) => res.json())
      .then(setZdjecia)
      .finally(() => setLadowanie(false));
  }

  async function handleDodaj(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!plik) return;
    setWysylanie(true);
    try {
      const src = await wgrajPlik(plik);
      const res = await fetch(`${API_URL}/galeria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opis, src }),
      });
      if (!res.ok) throw new Error();
      setOpis("");
      setPlik(null);
      pobierz();
    } catch {
      alert("Nie udało się dodać zdjęcia");
    } finally {
      setWysylanie(false);
    }
  }

  function handleUsun(id: string) {
    if (!confirm("Na pewno usunąć to zdjęcie?")) return;
    fetch(`${API_URL}/galeria/${id}`, { method: "DELETE" }).then(pobierz);
  }

  return (
    <>
      <form className="admin-formularz" onSubmit={handleDodaj}>
        <input
          type="text"
          placeholder="Opis zdjęcia"
          value={opis}
          onChange={(e) => setOpis(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPlik(e.target.files[0])
          }
          required
        />
        <button type="submit" disabled={wysylanie}>
          {wysylanie ? "Wgrywanie..." : "Dodaj zdjęcie"}
        </button>
      </form>

      {ladowanie ? (
        <p>Ładowanie...</p>
      ) : (
        <div className="admin-galeria-grid">
          {zdjecia.map((z) => (
            <div className="admin-galeria-kafelek" key={z.id}>
              <img src={z.src} alt={z.opis} />
              <div className="admin-galeria-opis">
                <p>{z.opis}</p>
              </div>
              <button onClick={() => handleUsun(z.id)}>Usuń</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default AdminPanel;
