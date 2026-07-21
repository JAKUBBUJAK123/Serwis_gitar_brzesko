import { useState, useEffect } from 'react'
import '../styles/adminStyle.css'

const ADMIN_HASLO = import.meta.env.VITE_ADMIN_HASLO
const API_URL = import.meta.env.VITE_API_URL

function AdminPanel() {
  const [pokazLogowanie, setPokazLogowanie] = useState(false)
  const [zalogowany, setZalogowany] = useState(false)
  const [haslo, setHaslo] = useState('')
  const [bladHasla, setBladHasla] = useState(false)

  const [produkty, setProdukty] = useState([])
  const [ladowanie, setLadowanie] = useState(false)
  const [edytowany, setEdytowany] = useState(null)
  const [formularz, setFormularz] = useState({ nazwa: '', dostepnosc: 'Dostępna', img: '' })

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        setPokazLogowanie(true)
      }
      if (e.key === 'Escape') {
        zamknij()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (zalogowany) pobierzProdukty()
  }, [zalogowany])

  function pobierzProdukty() {
    setLadowanie(true)
    fetch(`${API_URL}/wypozyczenia`)
      .then((res) => res.json())
      .then(setProdukty)
      .finally(() => setLadowanie(false))
  }

  function handleLogowanie(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (haslo === ADMIN_HASLO) {
      setZalogowany(true)
      setPokazLogowanie(false)
      setHaslo('')
      setBladHasla(false)
    } else {
      setBladHasla(true)
    }
  }

  function resetFormularza() {
    setEdytowany(null)
    setFormularz({ nazwa: '', dostepnosc: 'Dostępna', img: '' })
  }

  function handleEdytuj(produkt: any) {
    setEdytowany(produkt)
    setFormularz({ nazwa: produkt.nazwa, dostepnosc: produkt.dostepnosc, img: produkt.img })
  }

  function handleZapisz(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const metoda = edytowany ? 'PUT' : 'POST'
    const url = edytowany ? `${API_URL}/wypozyczenia/${edytowany.id}` : `${API_URL}/wypozyczenia`

    fetch(url, {
      method: metoda,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formularz),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Błąd zapisu')
        resetFormularza()
        pobierzProdukty()
      })
      .catch(() => alert('Nie udało się zapisać zmian'))
  }

  function handleUsun(id: number) {
    if (!confirm('Na pewno usunąć ten produkt?')) return
    fetch(`${API_URL}/wypozyczenia/${id}`, { method: 'DELETE' })
      .then(pobierzProdukty)
      .catch(() => alert('Błąd usuwania'))
  }

  function handleZmienStatus(produkt: any) {
    const nowyStatus = produkt.dostepnosc === 'Dostępna' ? 'Wypożyczona' : 'Dostępna'
    fetch(`${API_URL}/wypozyczenia/${produkt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dostepnosc: nowyStatus }),
    }).then(pobierzProdukty)
  }

  function zamknij() {
    setPokazLogowanie(false)
    setZalogowany(false)
    resetFormularza()
  }

  if (!pokazLogowanie && !zalogowany) return null

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
                setHaslo(e.target.value)
                setBladHasla(false)
              }}
            />
            {bladHasla && <p className="admin-blad">Nieprawidłowe hasło</p>}
            <div className="admin-akcje">
              <button type="submit" className="przycisk">Zaloguj</button>
              <button type="button" className="przycisk" onClick={() => setPokazLogowanie(false)}>
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {zalogowany && (
        <div className="admin-modal admin-panel">
          <div className="admin-naglowek">
            <h3>Zarządzanie wypożyczalnią</h3>
            <button className="admin-zamknij" onClick={zamknij}>✕</button>
          </div>

          <form className="admin-formularz" onSubmit={handleZapisz}>
            <input
              type="text"
              placeholder="Nazwa produktu"
              value={formularz.nazwa}
              onChange={(e) => setFormularz({ ...formularz, nazwa: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="URL obrazka"
              value={formularz.img}
              onChange={(e) => setFormularz({ ...formularz, img: e.target.value })}
              required
            />
            <select
              value={formularz.dostepnosc}
              onChange={(e) => setFormularz({ ...formularz, dostepnosc: e.target.value })}
            >
              <option value="Dostępna">Dostępna</option>
              <option value="Wypożyczona">Wypożyczona</option>
            </select>
            <button className="przycisk" type="submit">{edytowany ? 'Zapisz zmiany' : 'Dodaj produkt'}</button>
            {edytowany && (
              <button className="przycisk" type="button" onClick={resetFormularza}>
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
                      <button className="admin-status-toggle" onClick={() => handleZmienStatus(p)}>
                        {p.dostepnosc}
                      </button>
                    </td>
                    <td className="admin-akcje-kolumna">
                      <button className="przycisk" onClick={() => handleEdytuj(p)}>Edytuj</button>
                      <button className="usun" onClick={() => handleUsun(p.id)}>Usuń</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminPanel