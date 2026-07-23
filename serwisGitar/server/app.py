import json
import os
from pathlib import Path
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "db.json"
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

DOZWOLONE_ROZSZERZENIA = {"jpg", "jpeg", "png", "webp", "gif"}
MAX_ROZMIAR_MB = 10

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = MAX_ROZMIAR_MB * 1024 * 1024

def wczytaj_db():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def zapisz_db(dane):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(dane, f, ensure_ascii=False, indent=2)

def rozszerzenie_dozwolone(nazwa_pliku):
    return "." in nazwa_pliku and nazwa_pliku.rsplit(".", 1)[1].lower() in DOZWOLONE_ROZSZERZENIA

# --- serwowanie wgranych plików pod /uploads/nazwa.jpg ---
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

    url = f"{request.host_url}uploads/{nowa_nazwa}"
    return jsonify({"url": url})

def stworz_endpointy(nazwa_tabeli):
    @app.route(f"/{nazwa_tabeli}", methods=["GET"], endpoint=f"get_{nazwa_tabeli}")
    def pobierz_wszystkie():
        db = wczytaj_db()
        return jsonify(db.get(nazwa_tabeli, []))

    @app.route(f"/{nazwa_tabeli}", methods=["POST"], endpoint=f"post_{nazwa_tabeli}")
    def dodaj():
        db = wczytaj_db()
        nowy_wpis = {"id": str(uuid.uuid4()), **request.get_json()}
        db[nazwa_tabeli].append(nowy_wpis)
        zapisz_db(db)
        return jsonify(nowy_wpis), 201

    @app.route(f"/{nazwa_tabeli}/<id>", methods=["PUT"], endpoint=f"put_{nazwa_tabeli}")
    def edytuj(id):
        db = wczytaj_db()
        lista = db[nazwa_tabeli]
        idx = next((i for i, el in enumerate(lista) if el["id"] == id), None)
        if idx is None:
            return jsonify({"blad": "Nie znaleziono"}), 404
        lista[idx] = {**lista[idx], **request.get_json(), "id": id}
        zapisz_db(db)
        return jsonify(lista[idx])

    @app.route(f"/{nazwa_tabeli}/<id>", methods=["PATCH"], endpoint=f"patch_{nazwa_tabeli}")
    def edytuj_czesciowo(id):
        db = wczytaj_db()
        lista = db[nazwa_tabeli]
        idx = next((i for i, el in enumerate(lista) if el["id"] == id), None)
        if idx is None:
            return jsonify({"blad": "Nie znaleziono"}), 404
        lista[idx] = {**lista[idx], **request.get_json()}
        zapisz_db(db)
        return jsonify(lista[idx])

    @app.route(f"/{nazwa_tabeli}/<id>", methods=["DELETE"], endpoint=f"delete_{nazwa_tabeli}")
    def usun(id):
        db = wczytaj_db()
        lista = db[nazwa_tabeli]
        wpis = next((el for el in lista if el["id"] == id), None)
        db[nazwa_tabeli] = [el for el in lista if el["id"] != id]
        zapisz_db(db)

        # jeśli wpis miał plik z /uploads, usuń go też z dysku
        if wpis:
            pole_pliku = wpis.get("img") or wpis.get("src") or ""
            if "/uploads/" in pole_pliku:
                nazwa_pliku = pole_pliku.split("/uploads/")[-1]
                sciezka = UPLOADS_DIR / nazwa_pliku
                sciezka.unlink(missing_ok=True)

        return "", 204


stworz_endpointy("wypozyczenia")
stworz_endpointy("galeria")


if __name__ == "__main__":
    app.run(port=3001, debug=True)