import os
import uuid
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

# Ładujemy zmienne środowiskowe z pliku .env
load_dotenv()

# --- Konfiguracja Cloudinary ---
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

BASE_DIR = Path(__file__).resolve().parent
DOZWOLONE_ROZSZERZENIA = {"jpg", "jpeg", "png", "webp", "gif"}
MAX_ROZMIAR_MB = 10

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    allow_headers=["Content-Type", "X-App-Token", "X-Admin-Token"],
)
app.config["MAX_CONTENT_LENGTH"] = MAX_ROZMIAR_MB * 1024 * 1024

API_SECRET_TOKEN = os.getenv("API_SECRET_TOKEN")
ADMIN_HASLO = os.getenv("ADMIN_HASLO")


@app.before_request
def sprawdz_autoryzacje():
    if request.method == "OPTIONS" or request.path == "/ping":
        return None

    token_aplikacji = request.headers.get("X-App-Token")
    if token_aplikacji != API_SECRET_TOKEN:
        return jsonify({"blad": "Brak autoryzacji aplikacji (nieprawidłowy X-App-Token)"}), 401

    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        token_admina = request.headers.get("X-Admin-Token")
        if token_admina != ADMIN_HASLO:
            return jsonify({"blad": "Brak uprawnień administratora (nieprawidłowy X-Admin-Token)"}), 403

    return None

# --- Konfiguracja MongoDB ---
MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)
db = client.get_default_database() # Pobiera bazę zdefiniowaną w linku MONGO_URI


def formatuj_dokument(doc):
    """Usuwa wewnętrzne '_id' MongoDB, żeby nie psuć frontendu w Reactcie"""
    if doc and "_id" in doc:
        del doc["_id"]
    if doc:
        if "zdjecia" in doc and isinstance(doc["zdjecia"], list) and len(doc["zdjecia"]) > 0:
            if "src" not in doc or not doc["src"]:
                doc["src"] = doc["zdjecia"][0]
        elif "src" in doc and isinstance(doc["src"], str) and doc["src"]:
            doc["zdjecia"] = [doc["src"]]
    return doc

def rozszerzenie_dozwolone(nazwa_pliku):
    return "." in nazwa_pliku and nazwa_pliku.rsplit(".", 1)[1].lower() in DOZWOLONE_ROZSZERZENIA


@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "aktywny"}), 200

# --- Wgrywanie plików do Cloudinary ---
@app.route("/upload", methods=["POST"])
def upload():
    if "plik" not in request.files:
        return jsonify({"blad": "Brak pliku"}), 400

    plik = request.files["plik"]
    if plik.filename == "":
        return jsonify({"blad": "Brak pliku"}), 400

    if not rozszerzenie_dozwolone(plik.filename):
        return jsonify({"blad": "Niedozwolony format pliku"}), 400

    try:
        wynik_uploadu = cloudinary.uploader.upload(
            plik,
            folder="app_uploads"
        )
        
        secure_url = wynik_uploadu.get("secure_url")
        return jsonify({"url": secure_url})
        
    except Exception as e:
        return jsonify({"blad": str(e)}), 500


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
            del dane_update["id"]
            
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

        # Opcjonalnie: Jeśli chcesz usuwać plik również z Cloudinary przy usuwaniu dokumentu z bazy, 
        # można tutaj dodać logikę wyciągającą Public ID i używającą cloudinary.uploader.destroy().

        return "", 204


stworz_endpointy("wypozyczenia")
stworz_endpointy("galeria")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=port)