import { useState, useEffect } from "react";
import "../styles/adminStyle.css";
import {
  pobierzZdjeciaWypozyczenia,
  type Wypozyczenie,
} from "../types/Wypozyczenia";
import { pobierzZdjeciaObiektu, type Zdjecie } from "../types/Zdjecia";
import type { Ogloszenie } from "../types/Ogloszenia";
import { apiFetch } from "../utils/api";

const ADMIN_HASLO = import.meta.env.VITE_ADMIN_HASLO || "gitara123";

function AdminPanel() {
  const [pokazLogowanie, setPokazLogowanie] = useState(false);
  const [zalogowany, setZalogowany] = useState(false);
  const [haslo, setHaslo] = useState("");
  const [bladHasla, setBladHasla] = useState(false);
  const [zakladka, setZakladka] = useState<
    "wypozyczenia" | "galeria" | "ogloszenia"
  >("wypozyczenia");

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
          <div className="admin-login-header">
            <h3>Panel administratora</h3>
            <p>Wprowadź hasło, aby zarządzać stroną</p>
          </div>
          <form onSubmit={handleLogowanie}>
            <div className="admin-pole">
              <label htmlFor="admin-haslo">Hasło dostępu</label>
              <input
                id="admin-haslo"
                type="password"
                placeholder="Wpisz hasło..."
                autoFocus
                value={haslo}
                onChange={(e) => {
                  setHaslo(e.target.value);
                  setBladHasla(false);
                }}
              />
            </div>
            {bladHasla && (
              <p className="admin-blad">
                Nieprawidłowe hasło. Spróbuj ponownie.
              </p>
            )}
            <div className="admin-akcje">
              <button type="submit" className="admin-btn admin-btn-primary">
                Zaloguj się
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setPokazLogowanie(false)}
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {zalogowany && (
        <div className="admin-modal admin-panel">
          <div className="admin-naglowek">
            <div>
              <h3>Panel zarządzania stroną</h3>
              <p className="admin-podtytul">
                Dodawaj i edytuj instrumenty oraz zdjęcia w portfolio
              </p>
            </div>
            <button
              type="button"
              className="admin-zamknij"
              onClick={zamknij}
              title="Zamknij panel (Esc)"
            >
              Zamknij ✕
            </button>
          </div>

          <div className="admin-taby">
            <button
              type="button"
              className={
                "admin-tab-btn" +
                (zakladka === "wypozyczenia" ? " aktywna" : "")
              }
              onClick={() => setZakladka("wypozyczenia")}
            >
              Wypożyczenia
            </button>
            <button
              type="button"
              className={
                "admin-tab-btn" + (zakladka === "galeria" ? " aktywna" : "")
              }
              onClick={() => setZakladka("galeria")}
            >
              Galeria
            </button>
            <button
              type="button"
              className={
                "admin-tab-btn" + (zakladka === "ogloszenia" ? " aktywna" : "")
              }
              onClick={() => setZakladka("ogloszenia")}
            >
              Ogłoszenia
            </button>
          </div>

          <div className="admin-tresc">
            {zakladka === "wypozyczenia" && <PanelWypozyczenia />}
            {zakladka === "galeria" && <PanelGaleria />}
            {zakladka === "ogloszenia" && <PanelOgloszenia />}
          </div>
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

function PodgladZalacznikow({
  obecneZdjecia,
  pliki,
  onUsunObecne,
  onUsunNowy,
}: {
  obecneZdjecia: string[];
  pliki: File[];
  onUsunObecne: (idx: number) => void;
  onUsunNowy: (idx: number) => void;
}) {
  if (obecneZdjecia.length === 0 && pliki.length === 0) return null;

  const lacznaIlosc = obecneZdjecia.length + pliki.length;

  return (
    <div className="admin-zalaczniki-sekcja">
      <div className="admin-zalaczniki-naglowek">
        Wybrane zdjęcia ({lacznaIlosc}) — pierwsze zdjęcie będzie okładką:
      </div>
      <div className="admin-zalaczniki-lista">
        {obecneZdjecia.map((url, idx) => (
          <div className="admin-zalacznik-karta" key={`obecne-${idx}`}>
            {idx === 0 && (
              <span className="admin-zalacznik-okladka-badge">Okładka</span>
            )}
            <img src={url} alt={`Zdjęcie ${idx + 1}`} />
            <div className="admin-zalacznik-stopka">
              <span>Zapisane #{idx + 1}</span>
              <button
                type="button"
                className="admin-zalacznik-usun"
                title="Usuń to zdjęcie"
                onClick={() => onUsunObecne(idx)}
              >
                Usuń ✕
              </button>
            </div>
          </div>
        ))}
        {pliki.map((plik, idx) => {
          const czyOkladka = obecneZdjecia.length === 0 && idx === 0;
          const previewUrl = URL.createObjectURL(plik);
          return (
            <div className="admin-zalacznik-karta nowy" key={`nowy-${idx}`}>
              {czyOkladka && (
                <span className="admin-zalacznik-okladka-badge">Okładka</span>
              )}
              <img
                src={previewUrl}
                alt={plik.name}
                onLoad={() => URL.revokeObjectURL(previewUrl)}
              />
              <div className="admin-zalacznik-stopka">
                <span className="admin-zalacznik-nazwa" title={plik.name}>
                  {plik.name}
                </span>
                <button
                  type="button"
                  className="admin-zalacznik-usun"
                  title="Usuń załącznik"
                  onClick={() => onUsunNowy(idx)}
                >
                  Usuń ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
    <div className="admin-sekcja">
      <div
        className={"admin-karta-formularza" + (edytowany ? " tryb-edycji" : "")}
      >
        <div className="admin-karta-naglowek">
          <h4>
            {edytowany
              ? `Edytujesz instrument: ${edytowany.nazwa}`
              : "Dodaj nowy instrument do wypożyczalni"}
          </h4>
          {edytowany && <span className="admin-tryb-badge">Tryb edycji</span>}
        </div>

        <form className="admin-formularz" onSubmit={handleZapisz}>
          <div className="admin-form-wiersz">
            <div className="admin-pole">
              <label>Nazwa instrumentu *</label>
              <input
                type="text"
                placeholder="np. Fender Stratocaster MIM"
                value={nazwa}
                onChange={(e) => setNazwa(e.target.value)}
                required
              />
            </div>

            <div className="admin-pole admin-pole-krotkie">
              <label>Status dostępności</label>
              <select
                value={dostepnosc}
                onChange={(e) => setDostepnosc(e.target.value)}
              >
                <option value="Dostępna">Dostępna</option>
                <option value="Wypożyczona">Wypożyczona</option>
              </select>
            </div>
          </div>

          <div className="admin-pole">
            <label>Opis instrumentu (widoczny po kliknięciu)</label>
            <textarea
              placeholder="Opisz stan, specyfikację, strojenie lub warunki wypożyczenia..."
              value={opis}
              onChange={(e) => setOpis(e.target.value)}
              rows={3}
            />
          </div>

          <div className="admin-pole">
            <label>Zdjęcia instrumentu *</label>
            <label className="admin-upload-dropzone">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleWybierzPliki}
              />
              <span className="admin-upload-tytul">
                + Kliknij tutaj, aby wybrać zdjęcia z dysku
              </span>
              <span className="admin-upload-opis">
                Możesz zaznaczyć jedno lub kilka zdjęć naraz (JPG, PNG, WEBP)
              </span>
            </label>
          </div>

          <PodgladZalacznikow
            obecneZdjecia={obecneZdjecia}
            pliki={pliki}
            onUsunObecne={usunObecneZdjecie}
            onUsunNowy={usunNowyPlik}
          />

          <div className="admin-form-akcje">
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={wysylanie}
            >
              {wysylanie
                ? "Trwa zapisywanie i wgrywanie zdjęć..."
                : edytowany
                  ? "Zapisz zmiany"
                  : "Dodaj instrument"}
            </button>
            {edytowany && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={resetFormularza}
              >
                Anuluj edycję
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-lista-sekcja">
        <h4 className="admin-lista-naglowek">
          Lista instrumentów ({produkty.length})
        </h4>

        {ladowanie ? (
          <p className="admin-info-tekst">Ładowanie listy instrumentów...</p>
        ) : produkty.length === 0 ? (
          <p className="admin-info-tekst">
            Brak instrumentów na liście. Dodaj pierwszy powyżej.
          </p>
        ) : (
          <div className="admin-wypozyczenia-lista">
            {produkty.map((p) => {
              const zdjeciaProduktu = pobierzZdjeciaWypozyczenia(p);
              const okladka = zdjeciaProduktu[0] || "";
              const czyDostepna = p.dostepnosc === "Dostępna";
              return (
                <div
                  key={p.id}
                  className={
                    "admin-wypozyczenie-wiersz" +
                    (edytowany?.id === p.id ? " aktywny-wiersz" : "")
                  }
                >
                  <div className="admin-wypozyczenie-miniatura">
                    {okladka ? (
                      <img src={okladka} alt={p.nazwa} />
                    ) : (
                      <div className="admin-brak-zdjecia">Brak</div>
                    )}
                    <span className="admin-miniatura-licznik">
                      {zdjeciaProduktu.length} zdj.
                    </span>
                  </div>

                  <div className="admin-wypozyczenie-info">
                    <div className="admin-wypozyczenie-tytul">{p.nazwa}</div>
                    <div className="admin-wypozyczenie-opis">
                      {p.opis || "Brak opisu"}
                    </div>
                  </div>

                  <div className="admin-wypozyczenie-status">
                    <button
                      type="button"
                      title="Kliknij, aby szybko zmienić status dostępności"
                      className={
                        "admin-status-pill " +
                        (czyDostepna ? "status-dostepna" : "status-wypozyczona")
                      }
                      onClick={() => handleZmienStatus(p)}
                    >
                      <span className="admin-status-kropka" />
                      {p.dostepnosc}
                    </button>
                  </div>

                  <div className="admin-wypozyczenie-akcje">
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => handleEdytuj(p)}
                    >
                      Edytuj
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleUsun(p.id)}
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
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
    if (!confirm("Na pewno usunąć ten obiekt z galerii?")) return;
    apiFetch(`/galeria/${id}`, { method: "DELETE" }).then(() => pobierz(true));
  }

  return (
    <div className="admin-sekcja">
      <div
        className={"admin-karta-formularza" + (edytowany ? " tryb-edycji" : "")}
      >
        <div className="admin-karta-naglowek">
          <h4>
            {edytowany
              ? "Edytujesz wpis w galerii"
              : "Dodaj nową realizację do galerii"}
          </h4>
          {edytowany && <span className="admin-tryb-badge">Tryb edycji</span>}
        </div>

        <form className="admin-formularz" onSubmit={handleZapisz}>
          <div className="admin-pole">
            <label>Opis realizacji / projektu *</label>
            <textarea
              placeholder="Opisz co zostało zrobione przy gitarze..."
              value={opis}
              onChange={(e) => setOpis(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="admin-pole">
            <label>Zdjęcia realizacji *</label>
            <label className="admin-upload-dropzone">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleWybierzPliki}
              />
              <span className="admin-upload-tytul">
                + Kliknij tutaj, aby wybrać zdjęcia z dysku
              </span>
              <span className="admin-upload-opis">
                Możesz wybrać kilka zdjęć naraz lub dokładać kolejne przed
                zapisem
              </span>
            </label>
          </div>

          <PodgladZalacznikow
            obecneZdjecia={obecneZdjecia}
            pliki={pliki}
            onUsunObecne={usunObecneZdjecie}
            onUsunNowy={usunNowyPlik}
          />

          <div className="admin-form-akcje">
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={wysylanie}
            >
              {wysylanie
                ? "Trwa wgrywanie zdjęć..."
                : edytowany
                  ? "Zapisz zmiany"
                  : "Dodaj do galerii"}
            </button>
            {edytowany && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={resetFormularza}
              >
                Anuluj edycję
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-lista-sekcja">
        <h4 className="admin-lista-naglowek">
          Wpisów w galerii ({zdjecia.length})
        </h4>

        {ladowanie ? (
          <p className="admin-info-tekst">Ładowanie galerii...</p>
        ) : zdjecia.length === 0 ? (
          <p className="admin-info-tekst">
            Brak obiektów w galerii. Dodaj pierwszą realizację powyżej.
          </p>
        ) : (
          <div className="admin-galeria-grid">
            {zdjecia.map((z) => {
              const lista = pobierzZdjeciaObiektu(z);
              const okladka = lista[0] || "";
              return (
                <div
                  className={
                    "admin-galeria-kafelek" +
                    (edytowany?.id === z.id ? " aktywny-kafelek" : "")
                  }
                  key={z.id}
                >
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
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => handleEdytuj(z)}
                    >
                      Edytuj
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleUsun(z.id)}
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PanelOgloszenia() {
  const [ogloszenia, setOgloszenia] = useState<Ogloszenie[]>([]);
  const [ladowanie, setLadowanie] = useState(false);
  const [edytowany, setEdytowany] = useState<Ogloszenie | null>(null);
  const [link, setLink] = useState("");
  const [obecnyImg, setObecnyImg] = useState<string>("");
  const [plik, setPlik] = useState<File | null>(null);
  const [wysylanie, setWysylanie] = useState(false);

  useEffect(() => {
    pobierz();
  }, []);

  function pobierz(powiadomStrone = false) {
    setLadowanie(true);
    apiFetch("/ogloszenia")
      .then((res) => res.json())
      .then((dane) => {
        setOgloszenia(dane);
        if (powiadomStrone) {
          window.dispatchEvent(
            new CustomEvent("ogloszenia-zmienione", { detail: dane }),
          );
        }
      })
      .finally(() => setLadowanie(false));
  }

  function resetFormularza() {
    setEdytowany(null);
    setLink("");
    setObecnyImg("");
    setPlik(null);
  }

  function handleEdytuj(ogloszenie: Ogloszenie) {
    setEdytowany(ogloszenie);
    setLink(ogloszenie.link);
    setObecnyImg(ogloszenie.img || "");
    setPlik(null);
  }

  function handleWybierzPlik(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0]) return;
    setPlik(e.target.files[0]);
    setObecnyImg("");
    e.target.value = "";
  }

  async function handleZapisz(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!obecnyImg && !plik) {
      alert("Dodaj zdjęcie do ogłoszenia.");
      return;
    }
    setWysylanie(true);
    try {
      let img = obecnyImg;
      if (plik) {
        img = await wgrajPlik(plik);
      }

      const metoda = edytowany ? "PUT" : "POST";
      const sciezka = edytowany ? `/ogloszenia/${edytowany.id}` : `/ogloszenia`;

      const res = await apiFetch(sciezka, {
        method: metoda,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link, img }),
      });
      if (!res.ok) throw new Error();
      resetFormularza();
      pobierz(true);
    } catch {
      alert("Nie udało się zapisać ogłoszenia");
    } finally {
      setWysylanie(false);
    }
  }

  function handleUsun(id: string) {
    if (!confirm("Na pewno usunąć to ogłoszenie?")) return;
    apiFetch(`/ogloszenia/${id}`, { method: "DELETE" }).then(() =>
      pobierz(true),
    );
  }

  return (
    <div className="admin-sekcja">
      <div
        className={"admin-karta-formularza" + (edytowany ? " tryb-edycji" : "")}
      >
        <div className="admin-karta-naglowek">
          <h4>
            {edytowany ? "Edytujesz ogłoszenie" : "Dodaj nowe ogłoszenie"}
          </h4>
          {edytowany && <span className="admin-tryb-badge">Tryb edycji</span>}
        </div>

        <form className="admin-formularz" onSubmit={handleZapisz}>
          <div className="admin-pole">
            <label>Link do ogłoszenia (np. OLX, Allegro, Facebook) *</label>
            <input
              type="text"
              placeholder="https://www.olx.pl/d/oferta/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
            />
          </div>

          <div className="admin-pole">
            <label>Zdjęcie ogłoszenia *</label>
            <label className="admin-upload-dropzone">
              <input
                type="file"
                accept="image/*"
                onChange={handleWybierzPlik}
              />
              <span className="admin-upload-tytul">
                + Kliknij tutaj, aby wybrać zdjęcie ogłoszenia
              </span>
              <span className="admin-upload-opis">
                Wybierz plik graficzny z dysku (JPG, PNG, WEBP)
              </span>
            </label>
          </div>

          <PodgladZalacznikow
            obecneZdjecia={obecnyImg ? [obecnyImg] : []}
            pliki={plik ? [plik] : []}
            onUsunObecne={() => setObecnyImg("")}
            onUsunNowy={() => setPlik(null)}
          />

          <div className="admin-form-akcje">
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={wysylanie}
            >
              {wysylanie
                ? "Trwa zapisywanie..."
                : edytowany
                  ? "Zapisz zmiany"
                  : "Dodaj ogłoszenie"}
            </button>
            {edytowany && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={resetFormularza}
              >
                Anuluj edycję
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-lista-sekcja">
        <h4 className="admin-lista-naglowek">
          Lista ogłoszeń ({ogloszenia.length})
        </h4>

        {ladowanie ? (
          <p className="admin-info-tekst">Ładowanie ogłoszeń...</p>
        ) : ogloszenia.length === 0 ? (
          <p className="admin-info-tekst">
            Brak ogłoszeń. Dodaj pierwsze ogłoszenie powyżej.
          </p>
        ) : (
          <div className="admin-galeria-grid">
            {ogloszenia.map((o) => (
              <div
                className={
                  "admin-galeria-kafelek" +
                  (edytowany?.id === o.id ? " aktywny-kafelek" : "")
                }
                key={o.id}
              >
                <div className="admin-galeria-miniatura-wrap">
                  <img src={o.img} alt="Ogłoszenie" />
                </div>
                <div className="admin-galeria-opis">
                  <a
                    href={o.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-ogloszenie-link"
                    title={o.link}
                  >
                    {o.link}
                  </a>
                </div>
                <div className="admin-galeria-akcje">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => handleEdytuj(o)}
                  >
                    Edytuj
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => handleUsun(o.id)}
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
