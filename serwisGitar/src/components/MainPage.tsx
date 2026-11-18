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
    opis: "W tej zakładce znajduje się aktualny spis gitar dostępnych w naszej wypożyczalni. Przy każdym instrumencie zamieszczamy informacje o jego specyfikacji oraz aktualnym statusie dostępności. Dzięki temu mogą Państwo łatwo sprawdzić, jakie modele są obecnie dostępne do wypożyczenia.",
    link: "/wypozyczenia",
  },
  {
    id: 2,
    nazwa: "Ogłoszenia",
    img: "/imgs/blackRR.jpg",
    opis: "W tej sekcji znajdą Państwo przekierowania do naszych aktualnych ofert sprzedaży. Publikujemy tam ogłoszenia dotyczące gitar, części oraz sprzętu muzycznego. Zachęcamy do regularnego zaglądania – oferta może się zmieniać i pojawiać mogą się nowe, interesujące pozycje.",
    link: "/ogloszenia",
  },
  {
    id: 3,
    nazwa: "Projekty",
    img: "https://picsum.photos/id/250/700/500",
    opis: "Tutaj prezentujemy instrumenty, które przeszły kompleksowe przebudowy i modyfikacje. Każdy projekt to osobna historia, od początkowej koncepcji, przez dobór odpowiednich podzespołów, aż po efekt końcowy. To miejsce, w którym można zobaczyć, jak wiele można zmienić w gitarze dzięki odpowiednim pomysłom i pracy.",
    link: "/galeria",
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
            <div className="eyebrow">Witamy!</div>
            <h1>Adrian i Wiktor z tej strony!</h1>
            <p>
              Prowadzimy serwis gitarowy, w którym zajmujemy się wszystkim – od
              drobnych poprawek i regulacji (setupu) po kompleksowe przebudowy
              instrumentów. U nas kupisz, wypożyczysz lub naprawisz gitarę. Masz
              pytania dotyczące instrumentów lub nagłośnienia? Napisz do nas – z
              przyjemnością pomożemy! Trochę o nas Jesteśmy duetem pasjonatów,
              którzy zajmują się gitarami pod niemal każdym względem. Nasza
              działalność obejmuje nie tylko podstawowe usługi serwisowe, ale
              również sprzedaż, wypożyczanie oraz kompleksowe przebudowy
              instrumentów. Do każdego zlecenia podchodzimy z pełnym
              zaangażowaniem i pasją, niezależnie od tego, ile pracy wymaga dany
              instrument. Nie stoi za nami żadna wielka firma ani korporacja –
              działamy na własną rękę, samodzielnie zaopatrując się we wszystkie
              niezbędne narzędzia i części gitarowe.
            </p>
            <h1> O naszej stronie</h1>
            <p>
              Na naszej stronie znajdą Państwo wszystkie najważniejsze
              informacje dotyczące naszej działalności. Przygotowaliśmy między
              innymi portfolio naszych prac, listę gitar dostępnych do
              wypożyczenia wraz z aktualnymi statusami ich dostępności, a także
              zakładkę z naszymi ogłoszeniami.
            </p>
            <p>
              Chcemy, aby strona była nie tylko wizytówką naszego serwisu, ale
              również praktycznym miejscem, w którym można znaleźć potrzebne
              informacje i zapoznać się z naszą ofertą. Zależy nam na
              przejrzystości, dlatego staramy się, aby wszystkie najważniejsze
              informacje były łatwo dostępne i na bieżąco aktualizowane.
            </p>
            <p>
              W portfolio będziemy prezentować wybrane realizacje, naprawy i
              modyfikacje instrumentów, aby pokazać efekty naszej pracy oraz
              możliwości, jakie oferujemy. W zakładce wypożyczalni znajdą
              Państwo dostępne instrumenty i informacje o ich aktualnym
              statusie. Z kolei dział ogłoszeń pozwoli nam informować o nowych
              gitarach, częściach, sprzęcie oraz innych interesujących ofertach.
              Jeżeli nie znajdą Państwo odpowiedzi na nurtujące pytania,
              zachęcamy do bezpośredniego kontaktu. Chętnie doradzimy, pomożemy
              dobrać odpowiednie rozwiązanie i odpowiemy na wszelkie pytania
              związane z gitarami oraz sprzętem muzycznym. Zapraszamy do
              przeglądania strony i śledzenia naszych aktualności!
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
            Tutaj prezentujemy instrumenty, które przeszły kompleksowe
            przebudowy i modyfikacje. Każdy projekt to osobna historia, od
            początkowej koncepcji, przez dobór odpowiednich podzespołów, aż po
            efekt końcowy. To miejsce, w którym można zobaczyć, jak wiele można
            zmienić w gitarze dzięki odpowiednim pomysłom i pracy.
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
