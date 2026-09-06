# 🅿 SmartPark · Parking Management System — Complete Parking Management System

Real-time parking availability system with:
- 📸 Upload your actual parking layout photo
- 📍 Click to place spot markers directly on the photo
- 🔒 Password-protected admin panel (password: **12345**)(You can change it from app.py file in setup paths section)
- 📱 Fully responsive — works on mobile & desktop
- ⚡ Live updates every second

---

## 📁 Project Structure

```
smartpark/
│── app.py                  ← Flask backend (Python)
└── static/
    ├── index.html          ← Public user page
    ├── user.css            ← Public page styles
    ├── user.js             ← Public page JavaScript
    ├── admin.html          ← Admin dashboard
    ├── admin.css           ← Admin styles
    ├── admin.js            ← Admin JavaScript
    └── uploads/            ← Auto-created: layout images stored here
        └── spots_data.json ← Auto-created: spot positions & occupancy
```

---

## 🚀 Setup

### 1. Install Flask
```bash
pip install flask
```

### 2. Run
```bash
python app.py
```

### 3. Open
| Page       | URL                            |
|------------|-------------------------------|
| Public     | http://127.0.0.1:5000         |
| Admin      | http://127.0.0.1:5000/admin   |
| Mobile     | http://\<PC_IP\>:5000          |

---

## 🗺 How to Use

### Admin Setup (one-time)
1. Go to `/admin` and enter password **12345** --intial password (You can change it from app.py file in setup paths section
2. **Layout & Spots** tab → Upload your parking photo
3. Click **Add Mode** → click on the photo to drop spot pins
4. Edit each spot label (A1, B2, etc.)
5. Click **Save All Spots**

### Monitor (public)
- Open `/` on any device on the same network
- Green pins = available, red pins = occupied
- Auto-refreshes every second

### Simulate Sensors
- **Sensors / Simulate** tab in admin panel
- Toggle spots manually until real IoT sensors are connected
- Real sensors: `POST /api/admin/toggle/<spot_id>`

---

## 📡 API Reference

| Auth     | Method | Endpoint                          | Description              |
|----------|--------|-----------------------------------|--------------------------|
| Public   | GET    | `/api/status`                     | Get full parking status  |
| Admin    | POST   | `/api/admin/login`                | Login `{password}`       |
| Admin    | POST   | `/api/admin/logout`               | Logout                   |
| Admin    | GET    | `/api/admin/check`                | Check session            |
| Admin    | POST   | `/api/admin/upload-layout`        | Upload layout image      |
| Admin    | POST   | `/api/admin/spots`                | Save spot definitions    |
| Admin    | POST   | `/api/admin/toggle/<spot_id>`     | Toggle spot occupancy    |
| Admin    | POST   | `/api/admin/reset`                | Reset all to available   |
| Admin    | POST   | `/api/admin/clear-spots`          | Delete all spots         |
| Admin    | POST   | `/api/admin/delete-layout`        | Delete layout + spots    |

---

## 📱 Mobile Access
1. Find PC's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Connect mobile to the **same Wi-Fi**
3. Open `http://<PC_IP>:5000` on mobile
