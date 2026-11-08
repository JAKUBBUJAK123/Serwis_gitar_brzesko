import { useState, useEffect } from "react";
import "../styles/adminStyle.css";
import {
  pobierzZdjeciaWypozyczenia,
  type Wypozyczenie,
} from "../types/Wypozyczenia";
import { pobierzZdjeciaObiektu, type Zdjecie } from "../types/Zdjecia";
import { apiFetch } from "../utils/api";

const ADMIN_HASLO = import.meta.env.VITE_ADMIN_HASLO || "gitara123";

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
      sessionStorage.setItem("admin_token", haslo);
      setZalogowany(true);
      setPokazLogowanie(false);
      setHaslo("");
      setBladHasla(false);
    } else {
      setBladHasla(true);
    }
  }

  function zamknij() {
    sessionStorage.removeItem("admin_token");
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
  const res = await apiFetch("/upload", { method: "POST", body: dane });
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
  const [obecneZdjecia, setObecneZdjecia] = useState<string[]>([]);
  const [pliki, setPliki] = useState<File[]>([]);
  const [opis, setOpis] = useState("");
  const [wysylanie, setWysylanie] = useState(false);

  useEffect(() => {
    pobierz();
  }, []);

  function pobierz(powiadomStrone = false) {
    setLadowanie(true);
    apiFetch("/wypozyczenia")
      .then((res) => res.json())
      .then((dane) => {
        setProdukty(dane);
        if (powiadomStrone) {
          window.dispatchEvent(
            new CustomEvent("wypozyczenia-zmienione", { detail: dane }),
          );
        }
      })
      .finally(() => setLadowanie(false));
  }

  function resetFormularza() {
    setEdytowany(null);
    setNazwa("");
    setDostepnosc("Dostępna");
    setOpis("");
    setObecneZdjecia([]);
    setPliki([]);
  }

  function handleEdytuj(produkt: Wypozyczenie) {
    setEdytowany(produkt);
    setNazwa(produkt.nazwa);
    setDostepnosc(produkt.dostepnosc);
    setOpis(produkt.opis || "");
    setObecneZdjecia(pobierzZdjeciaWypozyczenia(produkt));
    setPliki([]);
  }

  function handleWybierzPliki(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const nowePliki = Array.from(e.target.files);
    setPliki((prev) => [...prev, ...nowePliki]);
    e.target.value = "";
  }

  function usunNowyPlik(index: number) {
    setPliki((prev) => prev.filter((_, i) => i !== index));
  }

  function usunObecneZdjecie(index: number) {
    setObecneZdjecia((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleZapisz(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (obecneZdjecia.length === 0 && pliki.length === 0) {
      alert("Dodaj przynajmniej jedno zdjęcie produktu.");
      return;
    }
    setWysylanie(true);
    try {
      const noweLinki = await Promise.all(pliki.map((plik) => wgrajPlik(plik)));
      const wszystkieZdjecia = [...obecneZdjecia, ...noweLinki];

      const metoda = edytowany ? "PUT" : "POST";
      const sciezka = edytowany
        ? `/wypozyczenia/${edytowany.id}`
        : `/wypozyczenia`;

      const res = await apiFetch(sciezka, {
        method: metoda,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nazwa,
          dostepnosc,
          opis,
          img: wszystkieZdjecia[0],
          zdjecia: wszystkieZdjecia,
        }),
      });
      if (!res.ok) throw new Error();
      resetFormularza();
      pobierz(true);
    } catch {
      alert("Nie udało się zapisać zmian");
    } finally {
      setWysylanie(false);
    }
  }

  function handleUsun(id: string) {
    if (!confirm("Na pewno usunąć ten produkt?")) return;
    apiFetch(`/wypozyczenia/${id}`, { method: "DELETE" }).then(() =>
      pobierz(true),
    );
  }

  function handleZmienStatus(produkt: Wypozyczenie) {
    const nowyStatus =
      produkt.dostepnosc === "Dostępna" ? "Wypożyczona" : "Dostępna";
    apiFetch(`/wypozyczenia/${produkt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dostepnosc: nowyStatus }),
    }).then(() => pobierz(true));
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
        <textarea
          placeholder="Opis produktu"
          value={opis}
          onChange={(e) => setOpis(e.target.value)}
          rows={3}
        />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleWybierzPliki}
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

        {(obecneZdjecia.length > 0 || pliki.length > 0) && (
          <div className="admin-zalaczniki-lista">
            {obecneZdjecia.map((url, idx) => (
              <div className="admin-zalacznik-item" key={`obecne-wyp-${idx}`}>
                <img src={url} alt={`Zdjęcie ${idx + 1}`} />
                <button
                  type="button"
                  title="Usuń to zdjęcie"
                  onClick={() => usunObecneZdjecie(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
            {pliki.map((plik, idx) => (
              <div
                className="admin-zalacznik-item nowy"
                key={`nowy-wyp-${idx}`}
              >
                <span className="admin-zalacznik-nazwa" title={plik.name}>
                  + {plik.name}
                </span>
                <button
                  type="button"
                  title="Usuń załącznik"
                  onClick={() => usunNowyPlik(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </form>

      {ladowanie ? (
        <p>Ładowanie...</p>
      ) : (
        <table className="admin-tabela">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Zdjęcia</th>
              <th>Status</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {produkty.map((p) => {
              const iloscZdjec = pobierzZdjeciaWypozyczenia(p).length;
              return (
                <tr key={p.id}>
                  <td>{p.nazwa}</td>
                  <td>{iloscZdjec} zdj.</td>
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
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}

function PanelGaleria() {
  const [zdjecia, setZdjecia] = useState<Zdjecie[]>([]);
  const [ladowanie, setLadowanie] = useState(false);
  const [edytowany, setEdytowany] = useState<Zdjecie | null>(null);
  const [opis, setOpis] = useState("");
  const [obecneZdjecia, setObecneZdjecia] = useState<string[]>([]);
  const [pliki, setPliki] = useState<File[]>([]);
  const [wysylanie, setWysylanie] = useState(false);

  useEffect(() => {
    pobierz();
  }, []);

  function pobierz(powiadomStrone = false) {
    setLadowanie(true);
    apiFetch("/galeria")
      .then((res) => res.json())
      .then((dane) => {
        setZdjecia(dane);
        if (powiadomStrone) {
          window.dispatchEvent(
            new CustomEvent("galeria-zmieniona", { detail: dane }),
          );
        }
      })
      .finally(() => setLadowanie(false));
  }

  function resetFormularza() {
    setEdytowany(null);
    setOpis("");
    setObecneZdjecia([]);
    setPliki([]);
  }

  function handleEdytuj(obiekt: Zdjecie) {
    setEdytowany(obiekt);
    setOpis(obiekt.opis);
    setObecneZdjecia(pobierzZdjeciaObiektu(obiekt));
    setPliki([]);
  }

  function handleWybierzPliki(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const nowePliki = Array.from(e.target.files);
    setPliki((prev) => [...prev, ...nowePliki]);
    e.target.value = "";
  }

  function usunNowyPlik(index: number) {
    setPliki((prev) => prev.filter((_, i) => i !== index));
  }

  function usunObecneZdjecie(index: number) {
    setObecneZdjecia((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleZapisz(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (obecneZdjecia.length === 0 && pliki.length === 0) {
      alert("Dodaj przynajmniej jedno zdjęcie do obiektu.");
      return;
    }
    setWysylanie(true);
    try {
      const noweLinki = await Promise.all(pliki.map((plik) => wgrajPlik(plik)));
      const wszystkieZdjecia = [...obecneZdjecia, ...noweLinki];

      const metoda = edytowany ? "PUT" : "POST";
      const sciezka = edytowany ? `/galeria/${edytowany.id}` : `/galeria`;

      const res = await apiFetch(sciezka, {
        method: metoda,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opis,
          src: wszystkieZdjecia[0],
          zdjecia: wszystkieZdjecia,
        }),
      });
      if (!res.ok) throw new Error();
      resetFormularza();
      pobierz(true);
    } catch {
      alert("Nie udało się dodać zdjęcia");
    } finally {
      setWysylanie(false);
    }
  }

  function handleUsun(id: string) {
    if (!confirm("Na pewno usunąć ten obiekt?")) return;
    apiFetch(`/galeria/${id}`, { method: "DELETE" }).then(() =>
      pobierz(true),
    );
  }

  return (
    <>
      <form className="admin-formularz" onSubmit={handleZapisz}>
        <input
          type="text"
          placeholder="Opis obiektu"
          value={opis}
          onChange={(e) => setOpis(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleWybierzPliki}
        />
        <button type="submit" disabled={wysylanie}>
          {wysylanie
            ? "Wgrywanie..."
            : edytowany
              ? "Zapisz zmiany"
              : "Dodaj obiekt"}
        </button>
        {edytowany && (
          <button type="button" onClick={resetFormularza}>
            Anuluj edycję
          </button>
        )}

        {(obecneZdjecia.length > 0 || pliki.length > 0) && (
          <div className="admin-zalaczniki-lista">
            {obecneZdjecia.map((url, idx) => (
              <div className="admin-zalacznik-item" key={`obecne-${idx}`}>
                <img src={url} alt={`Zdjęcie ${idx + 1}`} />
                <button
                  type="button"
                  title="Usuń to zdjęcie"
                  onClick={() => usunObecneZdjecie(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
            {pliki.map((plik, idx) => (
              <div className="admin-zalacznik-item nowy" key={`nowy-${idx}`}>
                <span className="admin-zalacznik-nazwa" title={plik.name}>
                  + {plik.name}
                </span>
                <button
                  type="button"
                  title="Usuń załącznik"
                  onClick={() => usunNowyPlik(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </form>

      {ladowanie ? (
        <p>Ładowanie...</p>
      ) : (
        <div className="admin-galeria-grid">
          {zdjecia.map((z) => {
            const lista = pobierzZdjeciaObiektu(z);
            const okladka = lista[0] || "";
            return (
              <div className="admin-galeria-kafelek" key={z.id}>
                <div className="admin-galeria-miniatura-wrap">
                  <img src={okladka} alt={z.opis} />
                  <span className="admin-galeria-licznik">
                    {lista.length} zdj.
                  </span>
                </div>
                <div className="admin-galeria-opis">
                  <p>{z.opis}</p>
                </div>
                <div className="admin-galeria-akcje">
                  <button type="button" onClick={() => handleEdytuj(z)}>
                    Edytuj
                  </button>
                  <button type="button" onClick={() => handleUsun(z.id)}>
                    Usuń
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default AdminPanel;
