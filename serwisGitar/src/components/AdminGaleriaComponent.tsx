import { useState, useEffect } from 'react'
import '../styles/adminStyle.css'

const ADMIN_HASLO = import.meta.env.VITE_ADMIN_HASLO
const API_URL = import.meta.env.VITE_API_URL

function AdminPanel() {
  const [pokazLogowanie, setPokazLogowanie] = useState(false)
  const [zalogowany, setZalogowany] = useState(false)
  const [haslo, setHaslo] = useState('')
  const [bladHasla, setBladHasla] = useState(false)

  const [zdjecia, setZdjecia] = useState([])
  const [ladowanie, setLadowanie] = useState(false)
  const [edytowany, setEdytowany] = useState(null)
const [formularz, setFormularz] = useState({ opis: '', src: '' })

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
    if (zalogowany) pobierzZdjecia()
  }, [zalogowany])

  function pobierzZdjecia() {
    setLadowanie(true)
    fetch(`${API_URL}/galeria`)
      .then((res) => res.json())
      .then(setZdjecia)
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
    setFormularz({ opis: '', src: '' })
  }

  function handleEdytuj(zdjecie: any) {
    setEdytowany(zdjecie)
    setFormularz({ opis: zdjecie.opis, src: zdjecie.src })
  }

  function handleZapisz(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const metoda = edytowany ? 'PUT' : 'POST'
    const url = edytowany ? `${API_URL}/galeria/${edytowany.id}` : `${API_URL}/galeria`

    fetch(url, {
      method: metoda,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formularz),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Błąd zapisu')
        resetFormularza()
        pobierzZdjecia()
      })
      .catch(() => alert('Nie udało się zapisać zmian'))
  }

  function handleUsun(id: number) {
    if (!confirm('Na pewno usunąć ten produkt?')) return
    fetch(`${API_URL}/galeria/${id}`, { method: 'DELETE' })
      .then(pobierzZdjecia)
      .catch(() => alert('Błąd usuwania'))
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
            <h3>Zarządzanie galerią</h3>
            <button className="admin-zamknij" onClick={zamknij}>✕</button>
          </div>

          <form className="admin-formularz" onSubmit={handleZapisz}>
            <input
              type="text"
              placeholder="Opis zdjęcia"
              value={formularz.opis}
              onChange={(e) => setFormularz({ ...formularz, opis: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="URL obrazka"
              value={formularz.src}
              onChange={(e) => setFormularz({ ...formularz, src: e.target.value })}
              required
            />
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
                  <th>Opis</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {zdjecia.map((z) => (
                  <tr key={z.id}>
                    <td>{z.opis}</td>
                    <td className="admin-akcje-kolumna">
                      <button className="przycisk" onClick={() => handleEdytuj(z)}>Edytuj</button>
                      <button className="usun" onClick={() => handleUsun(z.id)}>Usuń</button>
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