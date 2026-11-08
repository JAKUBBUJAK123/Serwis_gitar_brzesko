const API_URL = import.meta.env.VITE_API_URL;
const APP_TOKEN =
  import.meta.env.VITE_API_SECRET_TOKEN || "serwis-gitar-klucz-2026";
const ADMIN_HASLO = import.meta.env.VITE_ADMIN_HASLO || "gitara123";

export function apiFetch(sciezka: string, opcje: RequestInit = {}) {
  const headers = new Headers(opcje.headers);
  headers.set("X-App-Token", APP_TOKEN);

  const metoda = (opcje.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(metoda)) {
    const tokenAdmina = sessionStorage.getItem("admin_token") || ADMIN_HASLO;
    headers.set("X-Admin-Token", tokenAdmina);
  }

  return fetch(`${API_URL}${sciezka}`, {
    ...opcje,
    headers,
  });
}
