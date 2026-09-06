"""
app.py  SmartPark Parking Management System Backend
- Session-based admin auth  (password: 12345 --intial password and can be changed from setup paths in this file only)
- Parking layout image upload stored as uploads/<filename>
- Spot position management (x%, y% relative to image)
- Public status API
- Admin-only mutation APIs
"""

from flask import Flask, jsonify, request, send_from_directory, session
from functools import wraps
from werkzeug.utils import secure_filename
import os, json

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")
DATA_FILE = os.path.join(STATIC_DIR, "spots_data.json")
ALLOWED = {"png", "jpg", "jpeg", "webp"}
ADMIN_PASS = "12345"

os.makedirs(UPLOAD_DIR, exist_ok=True)

#Flask app 
app = Flask(__name__)
app.secret_key = "Parking_Management_System"
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024

# Data helpers
def load():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE) as f:
            return json.load(f)
    return {"layout_image": None, "spots": {}}

def save(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

def ok_ext(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED

# Auth decorator 
def admin_only(f):
    @wraps(f)
    def wrap(*a, **kw):
        if not session.get("admin"):
            return jsonify({"success": False, "error": "Unauthorized"}), 401
        return f(*a, **kw)
    return wrap

#  PAGE ROUTES
@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")

@app.route("/admin")
def admin_page():
    return send_from_directory(STATIC_DIR, "admin.html")

#  AUTH API
@app.route("/api/admin/login", methods=["POST"])
def login():
    pw = (request.get_json() or {}).get("password", "")
    if pw == ADMIN_PASS:
        session["admin"] = True
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Wrong password"}), 403

@app.route("/api/admin/logout", methods=["POST"])
def logout():
    session.pop("admin", None)
    return jsonify({"success": True})

@app.route("/api/admin/check")
def check():
    return jsonify({"logged_in": bool(session.get("admin"))})

#  PUBLIC API
@app.route("/api/status")
def status():
    data = load()
    spots = data.get("spots", {})
    total = len(spots)
    occ = sum(1 for s in spots.values() if s.get("occupied"))
    return jsonify({
        "layout_image": data.get("layout_image"),
        "spots": spots,
        "summary": {"total": total, "available": total - occ, "occupied": occ}
    })

#  ADMIN APIs
@app.route("/api/admin/upload-layout", methods=["POST"])
@admin_only
def upload_layout():
    if "image" not in request.files:
        return jsonify({"success": False, "error": "No file"}), 400
    f = request.files["image"]
    if not f.filename or not ok_ext(f.filename):
        return jsonify({"success": False, "error": "Bad file type"}), 400

    # Remove old layout files
    for old in os.listdir(UPLOAD_DIR):
        if old.startswith("layout_"):
            try: os.remove(os.path.join(UPLOAD_DIR, old))
            except: pass

    fname = secure_filename("layout_" + f.filename)
    f.save(os.path.join(UPLOAD_DIR, fname))

    url = f"/uploads/{fname}"
    d = load()
    d["layout_image"] = url
    save(d)
    return jsonify({"success": True, "url": url})

@app.route("/api/admin/spots", methods=["POST"])
@admin_only
def save_spots():
    body = request.get_json() or {}
    if "spots" not in body:
        return jsonify({"success": False, "error": "Missing spots"}), 400
    d = load()
    existing = d.get("spots", {})
    new = {}
    for sid, info in body["spots"].items():
        new[sid] = {
            "label": info.get("label", sid),
            "x": round(float(info.get("x", 50)), 3),
            "y": round(float(info.get("y", 50)), 3),
            "occupied": existing.get(sid, {}).get("occupied", False)
        }
    d["spots"] = new
    save(d)
    return jsonify({"success": True, "spots": new})

@app.route("/api/admin/toggle/<spot_id>", methods=["POST"])
@admin_only
def toggle(spot_id):
    d = load()
    spots = d.get("spots", {})
    if spot_id not in spots:
        return jsonify({"success": False, "error": "Spot not found"}), 404
    spots[spot_id]["occupied"] = not spots[spot_id]["occupied"]
    d["spots"] = spots
    save(d)
    return jsonify({"success": True, "new_status": spots[spot_id]})

@app.route("/api/admin/reset", methods=["POST"])
@admin_only
def reset():
    d = load()
    for s in d.get("spots", {}).values():
        s["occupied"] = False
    save(d)
    return jsonify({"success": True})

@app.route("/api/admin/clear-spots", methods=["POST"])
@admin_only
def clear_spots():
    d = load()
    d["spots"] = {}
    save(d)
    return jsonify({"success": True})

@app.route("/api/admin/delete-layout", methods=["POST"])
@admin_only
def delete_layout():
    d = load()
    if d.get("layout_image"):
        fname = os.path.basename(d["layout_image"])
        fp = os.path.join(UPLOAD_DIR, fname)
        if os.path.exists(fp):
            os.remove(fp)
    d["layout_image"] = None
    d["spots"] = {}
    save(d)
    return jsonify({"success": True})


# STATIC FILES CATCH-ALL
# Works for CSS, JS, uploads etc.
@app.route("/<path:filename>")
def serve_static(filename):
    file_path = os.path.join(STATIC_DIR, filename)
    if os.path.exists(file_path):
        return send_from_directory(STATIC_DIR, filename)
    return "File not found", 404

# RUN LOCALLY
if __name__ == "__main__":
    print("\n" + "="*52)
    print("  SmartPark · Parking Management System")
    print("  Public  →  http://127.0.0.1:5000")
    print("  Admin   →  http://127.0.0.1:5000/admin   (pw: 12345    --Initial Password(You can change it in app.py file in setup paths))")
    print("  Mobile  →  http://<YOUR_PC_IP>:5000")
    print("="*52 + "\n")
    app.run(host="0.0.0.0", port=5000, debug=True)
