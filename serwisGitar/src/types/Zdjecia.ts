export interface Zdjecie {
  id: string;
  opis: string;
  src?: string;
  zdjecia?: string[];
}

export function pobierzZdjeciaObiektu(obiekt: Zdjecie): string[] {
  if (Array.isArray(obiekt.zdjecia) && obiekt.zdjecia.length > 0) {
    return obiekt.zdjecia;
  }
  if (Array.isArray(obiekt.src)) {
    return obiekt.src;
  }
  if (typeof obiekt.src === "string" && obiekt.src.trim() !== "") {
    return [obiekt.src];
  }
  return [];
}
