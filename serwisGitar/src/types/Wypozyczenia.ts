export interface Wypozyczenie {
  id: string;
  nazwa: string;
  dostepnosc: "Dostępna" | "Wypożyczona";
  img?: string;
  zdjecia?: string[];
  opis?: string;
}

export function pobierzZdjeciaWypozyczenia(produkt: Wypozyczenie): string[] {
  if (Array.isArray(produkt.zdjecia) && produkt.zdjecia.length > 0) {
    return produkt.zdjecia;
  }
  if (Array.isArray(produkt.img)) {
    return produkt.img;
  }
  if (typeof produkt.img === "string" && produkt.img.trim() !== "") {
    return [produkt.img];
  }
  return [];
}
