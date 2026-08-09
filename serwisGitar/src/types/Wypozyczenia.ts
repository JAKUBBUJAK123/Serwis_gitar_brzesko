export interface Wypozyczenie {
  id: string;
  nazwa: string;
  dostepnosc: "Dostępna" | "Wypożyczona";
  img: string;
  opis?: string;
}