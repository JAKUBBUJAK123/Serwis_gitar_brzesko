import "../styles/mainStyle.css";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const PRODUKTY = [
  {
    id: 1,
    nazwa: "Wypożyczenie gitar",
    img: "/imgs/Jolana.jpg",
    opis: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    link: "/wypozyczenia",
  },
  {
    id: 2,
    nazwa: "Sprzedaż gitar i akcesoriów",
    img: "/imgs/blackRR.jpg",
    opis: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    link: "/",
  },
  {
    id: 3,
    nazwa: "Fotografia gitar",
    img: "https://picsum.photos/id/250/700/500",
    opis: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    link: "/galeria",
  },
  {
    id: 4,
    nazwa: "Renowacja lakieru",
    img: "https://picsum.photos/id/342/700/500",
    opis: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    link: "/",
  },
];

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
  );
}

function MainPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [location]);

  return (
    <>
      <div className="luthier-page">
        <Navbar />
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
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
          </div>
          <div className="zdjecie">
            <img src="/imgs/guitar1.jpg" alt="gitara" />
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
              <Link to={p.link}>
                <article className="produkt-card" key={p.id}>
                  <img src={p.img} alt={p.nazwa} />
                  <div className="tresc">
                    <h3>{p.nazwa}</h3>
                    <p>{p.opis}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
        <StringDivider />

        <section id="kontakt" className="section" style={{ paddingTop: 0 }}>
          <div className="kontakt-wrap">
            <div className="kontakt-info">
              <h2>Kontakt</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
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

        <footer>© {new Date().getFullYear()} Gitarowy kącik</footer>
      </div>
    </>
  );
}

export default MainPage;
