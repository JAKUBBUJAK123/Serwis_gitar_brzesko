import '../styles/mainStyle.css'
import { useState, useEffect } from 'react'
import AdminPanel from './AdminComponent'

// Placeholdery – firma podmieni zdjęcia i teksty docelowo
const PRODUKTY = [
  {
    id: 1,
    nazwa: 'Regulacja gryfu (setup)',
    img: 'https://picsum.photos/id/1074/700/500',
    opis:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 2,
    nazwa: 'Wymiana i regulacja strun',
    img: 'https://picsum.photos/id/1080/700/500',
    opis:
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    id: 3,
    nazwa: 'Naprawa elektroniki',
    img: 'https://picsum.photos/id/250/700/500',
    opis:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  },
  {
    id: 4,
    nazwa: 'Renowacja lakieru',
    img: 'https://picsum.photos/id/342/700/500',
    opis:
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
]


function StringDivider() {
  return (
    <div className="string-divider" aria-hidden="true">
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path
          d="M0,20 C 150,5 300,35 450,20 C 600,5 750,35 900,20 C 1000,10 1100,30 1200,20"
          fill="none"
        />
      </svg>
    </div>
  )
}

function MainPage() {

  const [wypozyczenia, setWypozyczenia] = useState([])
  const [ladowanie, setLadowanie] = useState(true)
  const [blad, setBlad] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/wypozyczenia`)
      .then((res) => {
        if (!res.ok) throw new Error('Błąd pobierania danych')
        return res.json()
      })
      .then((dane) => {
        setWypozyczenia(dane)
        setLadowanie(false)
      })
      .catch((err) => {
        setBlad(err.message)
        setLadowanie(false)
      })
  }, [])

  return (
    <>

      <div className="luthier-page">
        <AdminPanel />
        <nav className="navbar">
          <div className="brand">
            Serwis Gitar Brzesko
            <span>Serwis Gitarowy</span>
          </div>
          <ul className="nav-links">
            <li><a href="#o-nas">O nas</a></li>
            <li><a href="#produkty">Produkty</a></li>
            <li><a href="#kontakt">Kontakt</a></li>
          </ul>
        </nav>

        <section id="o-nas" className="section o-nas">
          <div>
            <div className="eyebrow">Jebac disa</div>
            <h1>Testestestestes.</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </div>
          <div className="zdjecie">
            <img
              src="https://picsum.photos/id/1062/700/700"
              alt="Warsztat lutniczy – zdjęcie placeholder"
            />
          </div>
        </section>

        <StringDivider />

        <section id="produkty" className="section produkty">
          <h2>Nasze usługi</h2>
          <p className="section-lead">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit — poniżej
            przykładowe kategorie usług serwisowych.
          </p>
          <div className="produkty-grid">
            {PRODUKTY.map((p) => (
              <article className="produkt-card" key={p.id}>
                <img src={p.img} alt={p.nazwa} />
                <div className="tresc">
                  <h3>{p.nazwa}</h3>
                  <p>{p.opis}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <StringDivider />
<section id="wypożyczenia" className="section wypozyczenia">
  <h2>Wypożyczenia</h2>
  <p className="section-lead">
    Lorem ipsum dolor sit amet — poniżej przykładowa lista instrumentów
    dostępnych do wypożyczenia.
  </p>
  {ladowanie && <p>Ładowanie danych...</p>}
  {blad && <p className="status-brak">Nie udało się pobrać danych: {blad}</p>}
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
                    <img src={g.img} alt={g.nazwa} className="wypozyczenia-img" />
                  </td>
                  <td>
                    <span
                      className={
                        'status-badge ' +
                        (g.dostepnosc === 'Dostępna' ? 'status-ok' : 'status-brak')
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
        <StringDivider />

        <section id="kontakt" className="section" style={{ paddingTop: 0 }}>
          <div className="kontakt-wrap">
            <div className="kontakt-info">
              <h2>Kontakt</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                do eiusmod tempor incididunt ut labore et dolore magna
                aliqua.
              </p>
              <ul>
                <li>ul. Przykładowa 12, 00-000 Miasto</li>
                <li>+48 000 000 000</li>
                <li>kontakt@lutniaistruna.pl</li>
                <li>Pon–Pt: 10:00–18:00</li>
              </ul>
            </div>
          </div>
        </section>

        <footer>© {new Date().getFullYear()} Serwis gitarowy Brzesko</footer>
      </div>
    </>
  )
}

export default MainPage