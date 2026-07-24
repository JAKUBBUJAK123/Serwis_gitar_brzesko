import os
import uuid
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

# Ładujemy zmienne środowiskowe z pliku .env
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
DOZWOLONE_ROZSZERZENIA = {"jpg", "jpeg", "png", "webp", "gif"}
MAX_ROZMIAR_MB = 10

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = MAX_ROZMIAR_MB * 1024 * 1024

# --- Konfiguracja MongoDB ---
MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)
db = client.get_default_database() # Pobiera bazę zdefiniowaną w linku MONGO_URI


def formatuj_dokument(doc):
    """Usuwa wewnętrzne '_id' MongoDB, żeby nie psuć frontendu w Reactcie"""
    if doc and "_id" in doc:
        del doc["_id"]
    return doc

def rozszerzenie_dozwolone(nazwa_pliku):
    return "." in nazwa_pliku and nazwa_pliku.rsplit(".", 1)[1].lower() in DOZWOLONE_ROZSZERZENIA

# --- Serwowanie i wgrywanie plików (tymczasowo zostawione lokalnie) ---
@app.route("/uploads/<nazwa_pliku>")
def serwuj_plik(nazwa_pliku):
    return send_from_directory(UPLOADS_DIR, nazwa_pliku)

@app.route("/upload", methods=["POST"])
def upload():
    if "plik" not in request.files:
        return jsonify({"blad": "Brak pliku"}), 400

    plik = request.files["plik"]
    if plik.filename == "":
        return jsonify({"blad": "Brak pliku"}), 400

    if not rozszerzenie_dozwolone(plik.filename):
        return jsonify({"blad": "Niedozwolony format pliku"}), 400

    rozszerzenie = plik.filename.rsplit(".", 1)[1].lower()
    nowa_nazwa = f"{uuid.uuid4()}.{rozszerzenie}"
    plik.save(UPLOADS_DIR / nowa_nazwa)

    base_url = os.getenv("BACKEND_URL") or request.host_url.rstrip("/")
    url = f"{base_url}/uploads/{nowa_nazwa}"
    return jsonify({"url": url})


# --- Dynamiczne generowanie endpointów z MongoDB ---
def stworz_endpointy(nazwa_tabeli):
    kolekcja = db[nazwa_tabeli]

    @app.route(f"/{nazwa_tabeli}", methods=["GET"], endpoint=f"get_{nazwa_tabeli}")
    def pobierz_wszystkie():
        dane = list(kolekcja.find({}))
        return jsonify([formatuj_dokument(doc) for doc in dane])

    @app.route(f"/{nazwa_tabeli}", methods=["POST"], endpoint=f"post_{nazwa_tabeli}")
    def dodaj():
        nowy_wpis = {"id": str(uuid.uuid4()), **request.get_json()}
        # Kopiujemy słownik, bo insert_one modyfikuje go dodając '_id'
        kolekcja.insert_one(nowy_wpis.copy())
        return jsonify(nowy_wpis), 201

    @app.route(f"/{nazwa_tabeli}/<id>", methods=["PUT"], endpoint=f"put_{nazwa_tabeli}")
    def edytuj(id):
        dane_update = request.get_json()
        dane_update["id"] = id 
        
        wynik = kolekcja.find_one_and_update(
            {"id": id},
            {"$set": dane_update},
            return_document=True
        )
        if not wynik:
            return jsonify({"blad": "Nie znaleziono"}), 404
        return jsonify(formatuj_dokument(wynik))

    @app.route(f"/{nazwa_tabeli}/<id>", methods=["PATCH"], endpoint=f"patch_{nazwa_tabeli}")
    def edytuj_czesciowo(id):
        dane_update = request.get_json()
        if "id" in dane_update:
            del dane_update["id"] # Zabezpieczenie przed nadpisaniem ID
            
        wynik = kolekcja.find_one_and_update(
            {"id": id},
            {"$set": dane_update},
            return_document=True
        )
        if not wynik:
            return jsonify({"blad": "Nie znaleziono"}), 404
        return jsonify(formatuj_dokument(wynik))

    @app.route(f"/{nazwa_tabeli}/<id>", methods=["DELETE"], endpoint=f"delete_{nazwa_tabeli}")
    def usun(id):
        wpis = kolekcja.find_one({"id": id})
        if not wpis:
            return "", 204
            
        kolekcja.delete_one({"id": id})

        # Jeśli wpis miał plik z /uploads, usuń go z lokalnego dysku
        pole_pliku = wpis.get("img") or wpis.get("src") or ""
        if "/uploads/" in pole_pliku:
            nazwa_pliku = pole_pliku.split("/uploads/")[-1]
            sciezka = UPLOADS_DIR / nazwa_pliku
            sciezka.unlink(missing_ok=True)

        return "", 204


stworz_endpointy("wypozyczenia")
stworz_endpointy("galeria")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=port)