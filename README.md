# 🅿️ SmartPark — Smart Parking Management System

A real-time parking management system that allows administrators to configure a parking layout, define parking slots, monitor slot occupancy, and provide users with live parking availability through a responsive web interface.

SmartPark is designed as a modular system that can work with simulated parking sensors during development and can be extended to use physical IoT sensors through an Arduino-based hardware layer.

---

## 📌 Overview

Finding available parking spaces manually can waste time and create unnecessary congestion inside parking areas.

**SmartPark** addresses this problem by providing a centralized system for monitoring parking-slot availability.

The system allows an administrator to:

* Upload an actual parking-lot layout image
* Place parking-slot markers directly on the image
* Assign labels to parking slots
* Monitor slot occupancy
* Simulate sensor states during development
* Reset or clear parking-slot data
* Manage the parking layout
* Control the system through an admin dashboard

Users can view the parking layout and identify available and occupied spaces in real time.

The system also includes an Arduino-based hardware component and a Python bridge layer for extending the system toward physical IoT-based parking detection.

---

## 🎯 Problem Statement

Traditional parking management often requires drivers to manually search for available spaces.

This can result in:

* Unnecessary vehicle movement
* Time wastage
* Traffic congestion inside parking areas
* Poor visibility of available spaces
* Manual monitoring by parking staff

SmartPark provides a centralized digital interface for monitoring parking occupancy and displaying parking availability to users.

---

## 💡 Proposed Solution

SmartPark divides the system into three major layers:

```text
┌──────────────────────────────┐
│        User Interface        │
│     HTML / CSS / JavaScript  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Flask Backend          │
│     REST API + Admin Auth    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     Parking Data Layer       │
│       JSON Persistence       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      IoT / Hardware Layer    │
│      Arduino + Bridge        │
└──────────────────────────────┘
```

The web application can operate independently using simulated occupancy states, while the hardware layer provides a path toward real-world sensor integration.

---

## ✨ Key Features

### 👤 User Side

* View parking-lot layout
* View parking-slot locations
* Identify available parking spaces
* Identify occupied parking spaces
* Real-time status updates
* Responsive interface for desktop and mobile devices

### 🔐 Admin Side

* Password-protected admin dashboard
* Upload parking-layout image
* Add parking-slot markers
* Edit parking-slot labels
* Save parking-slot coordinates
* Toggle parking occupancy
* Reset all parking slots
* Clear parking-slot configuration
* Delete parking layout

### 📡 IoT / Hardware Support

* Arduino-based hardware integration
* Parking occupancy simulation during development
* Python bridge layer for communication
* Designed for future physical sensor integration

### ⚡ Backend

* Flask REST API
* Session-based admin authentication
* JSON-based data persistence
* Image upload handling
* Parking-slot management
* Occupancy management
* Protected admin endpoints

---

## 🛠️ Technology Stack

| Component              | Technology              |
| ---------------------- | ----------------------- |
| Frontend               | HTML5, CSS3, JavaScript |
| Backend                | Python, Flask           |
| Data Storage           | JSON                    |
| Hardware               | Arduino                 |
| Hardware Communication | Python Bridge           |
| API                    | REST-style HTTP API     |
| Image Handling         | Flask + Werkzeug        |
| Version Control        | Git / GitHub            |

---

## 🏗️ Project Architecture

```text
SmartPark-Parking-Management-System/
│
├── smartpark/
│   │
│   ├── app.py
│   │   ├── Flask application
│   │   ├── Admin authentication
│   │   ├── Parking APIs
│   │   ├── Layout management
│   │   └── Occupancy management
│   │
│   ├── bridge.py
│   │   └── Hardware / software communication layer
│   │
│   ├── ardiuno.ino
│   │   └── Arduino hardware program
│   │
│   └── static/
│       │
│       ├── index.html
│       │   └── Public parking interface
│       │
│       ├── user.css
│       │   └── User interface styling
│       │
│       ├── user.js
│       │   └── User-side functionality
│       │
│       ├── admin.html
│       │   └── Admin dashboard
│       │
│       ├── admin.css
│       │   └── Admin interface styling
│       │
│       ├── admin.js
│       │   └── Admin-side functionality
│       │
│       ├── uploads/
│       │   └── Parking-layout images
│       │
│       └── spots_data.json
│           └── Parking-slot configuration and occupancy data
│
└── README.md
```

---

# 🚀 Installation & Setup

## 1. Clone the repository

```bash
git clone https://github.com/Priyanshugairola-9/SmartPark-Parking-Management-System.git
```

Move into the project directory:

```bash
cd SmartPark-Parking-Management-System
```

---

## 2. Move into the application directory

```bash
cd smartpark
```

---

## 3. Create a virtual environment

Windows:

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

Linux/macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 4. Install dependencies

```bash
pip install flask
```

If a `requirements.txt` file is added later, dependencies can instead be installed using:

```bash
pip install -r requirements.txt
```

---

## 5. Run the application

```bash
python app.py
```

The Flask server runs on:

```text
http://127.0.0.1:5000
```

---

# 🌐 Application URLs

| Interface           | URL                           |
| ------------------- | ----------------------------- |
| User Interface      | `http://127.0.0.1:5000`       |
| Admin Dashboard     | `http://127.0.0.1:5000/admin` |
| Mobile / LAN Access | `http://<PC_IP>:5000`         |

For mobile access, connect the phone and computer to the same Wi-Fi network.

Find the computer's IP address:

```bash
ipconfig
```

Then open:

```text
http://<YOUR_PC_IP>:5000
```

on the mobile device.

---

# 🔐 Admin Access

The current development version uses a simple password-based admin login.

Default password:

```text
12345
```
Security Note: SmartPark currently uses a configurable local administrator password and Flask session-based authentication. The default password is provided for development/testing and should be changed before use. For production deployment, environment variables, password hashing, HTTPS, and stronger authentication should be implemented.

**Important:** This is a development configuration. The password is currently defined inside `app.py`.

For production deployment, the authentication system should be improved by:

* Using environment variables
* Hashing passwords
* Using secure session configuration
* Adding proper user accounts
* Implementing role-based access control

---

# 🗺️ How to Configure Parking

## Step 1 — Open Admin Dashboard

Go to:

```text
http://127.0.0.1:5000/admin
```

Login using the configured admin password.

## Step 2 — Upload Parking Layout

Upload an image representing the actual parking area.

Supported image formats include:

```text
PNG
JPG
JPEG
WEBP
```

## Step 3 — Add Parking Slots

Enable the slot-addition mode and click on the appropriate positions on the parking-layout image.

Each slot can be assigned a label such as:

```text
A1
A2
A3
B1
B2
B3
```

## Step 4 — Save Slot Configuration

Save the configured parking slots.

The system stores slot coordinates relative to the parking-layout image.

## Step 5 — Monitor Parking

Open the public interface.

The system displays:

```text
🟢 Available
🔴 Occupied
```

Parking status is periodically updated through the backend API.

---

# 📡 Parking Occupancy Simulation

During development, physical sensors do not have to be connected.

The admin can manually toggle parking slots to simulate sensor readings.

For example:

```text
A1 → Available
A2 → Occupied
A3 → Available
B1 → Occupied
```

This allows the complete software system to be tested before deploying physical hardware.

---

# 🔌 IoT / Arduino Integration

The project contains an Arduino program:

```text
smartpark/ardiuno.ino
```

and a Python communication layer:

```text
smartpark/bridge.py
```

The intended architecture is:

```text
Parking Sensor
      │
      ▼
   Arduino
      │
      ▼
 bridge.py
      │
      ▼
 Flask Backend
      │
      ▼
 Parking Database
      │
      ▼
 Web Interface
```

This architecture allows physical parking sensors to eventually replace the manual simulation mechanism.

---

# 📡 API Reference

## Public API

### Get Parking Status

```http
GET /api/status
```

Returns:

* Parking-layout information
* Parking-slot information
* Occupied slots
* Available slots
* Total slots

Example response:

```json
{
  "layout_image": "/uploads/layout_parking.jpg",
  "spots": {},
  "summary": {
    "total": 20,
    "available": 14,
    "occupied": 6
  }
}
```

---

## Admin Authentication

### Login

```http
POST /api/admin/login
```

Request:

```json
{
  "password": "12345"
}
```

### Logout

```http
POST /api/admin/logout
```

### Check Login Status

```http
GET /api/admin/check
```

---

## Parking Management APIs

### Upload Layout

```http
POST /api/admin/upload-layout
```

Uploads a parking-layout image.

### Save Parking Slots

```http
POST /api/admin/spots
```

Stores parking-slot definitions and their coordinates.

### Toggle Slot

```http
POST /api/admin/toggle/<spot_id>
```

Changes the occupancy state of a parking slot.

### Reset Parking

```http
POST /api/admin/reset
```

Marks all parking slots as available.

### Clear Slots

```http
POST /api/admin/clear-spots
```

Deletes the configured parking slots.

### Delete Layout

```http
POST /api/admin/delete-layout
```

Deletes the current parking layout and associated slot configuration.

---

# 🔄 System Workflow

```text
        Admin
          │
          ▼
 Upload Parking Layout
          │
          ▼
 Place Parking Slots
          │
          ▼
 Save Slot Configuration
          │
          ▼
 ┌─────────────────────┐
 │ Parking Data Store  │
 └──────────┬──────────┘
            │
            ▼
     Occupancy Update
            │
       ┌────┴─────┐
       │          │
       ▼          ▼
   Simulation   IoT Sensor
       │          │
       └────┬─────┘
            ▼
      Flask Backend
            │
            ▼
       REST API
            │
            ▼
     Public Interface
            │
            ▼
    Available / Occupied
```

---

# 🧩 Data Representation

Each parking slot contains information such as:

```json
{
  "label": "A1",
  "x": 35.5,
  "y": 42.2,
  "occupied": false
}
```

Where:

* `label` identifies the parking slot
* `x` represents the horizontal position
* `y` represents the vertical position
* `occupied` represents the current parking status

The coordinates are stored relative to the uploaded parking-layout image, allowing the markers to remain positioned correctly when the interface is displayed.

---

# 🔒 Security Considerations

The current version is intended primarily for local/development use.

The following improvements are recommended before production deployment:

* Move passwords and secret keys to environment variables
* Hash administrator passwords
* Disable Flask debug mode in production
* Use HTTPS
* Add CSRF protection
* Validate uploaded files more strictly
* Add proper user authentication
* Add role-based authorization
* Add rate limiting
* Use a production database instead of JSON storage
* Restrict hardware/API access to authorized devices

---

# 📱 Responsive Design

SmartPark is designed to work across:

* Desktop computers
* Laptops
* Tablets
* Mobile devices

For mobile testing, both devices should be connected to the same local network.

---

# 🧪 Testing

The system can be tested without physical parking sensors.

Recommended test sequence:

```text
1. Start Flask server
2. Open Admin Dashboard
3. Login
4. Upload parking layout
5. Add parking slots
6. Save slots
7. Open public interface
8. Toggle slot occupancy
9. Verify public status
10. Reset parking
11. Verify all slots become available
```

---

# 📈 Future Improvements

The current system provides the foundation for a more advanced smart-parking platform.

Possible future improvements include:

### 🤖 Automatic Vehicle Detection

Integrate computer vision to automatically determine whether a parking space is occupied.

Possible technologies:

* OpenCV
* YOLO
* Computer Vision models

### 📷 Camera-Based Monitoring

Use CCTV/IP cameras to continuously monitor parking spaces.

### 🔢 License Plate Recognition

Add automatic vehicle identification using:

* OCR
* Automatic Number Plate Recognition (ANPR)

### 📊 Analytics Dashboard

Add statistics such as:

* Parking utilization
* Peak parking hours
* Average parking duration
* Occupancy trends
* Daily/weekly/monthly reports

### 💳 Automated Billing

Add:

* Parking-duration calculation
* Dynamic pricing
* Digital payments
* Receipts

### 🗄️ Database Migration

Replace JSON storage with a proper database such as:

```text
MySQL
PostgreSQL
MongoDB
```

### 👥 Multi-User Authentication

Add different roles:

```text
Admin
Parking Staff
User
```

### ☁️ Cloud Deployment

Deploy the backend and database using cloud infrastructure.

### 📡 Real IoT Sensors

Replace simulated occupancy with physical sensors such as:

```text
IR Sensors
Ultrasonic Sensors
Magnetic Sensors
ESP32
Arduino
```

---

# 📊 Current System vs Future System

| Capability                  | Current Version | Future Enhancement |
| --------------------------- | --------------: | -----------------: |
| Parking layout              |               ✅ |                  — |
| Slot mapping                |               ✅ |                  — |
| Slot occupancy              |               ✅ |                  — |
| Admin dashboard             |               ✅ |                  — |
| REST API                    |               ✅ |                  — |
| JSON persistence            |               ✅ |           Database |
| Occupancy simulation        |               ✅ |                  — |
| Arduino integration         |    ✅ Foundation |           Expanded |
| Automatic vehicle detection |               ❌ |                  ✅ |
| Camera monitoring           |               ❌ |                  ✅ |
| Number-plate recognition    |               ❌ |                  ✅ |
| Online payments             |               ❌ |                  ✅ |
| Advanced analytics          |               ❌ |                  ✅ |
| Cloud deployment            |               ❌ |                  ✅ |

---

# 🎓 Project Objectives

The major objectives of SmartPark are:

1. Digitize parking-space management.
2. Provide real-time visibility of parking availability.
3. Reduce manual parking-space monitoring.
4. Provide a configurable parking-layout interface.
5. Create a software architecture that can integrate with IoT hardware.
6. Provide a foundation for future computer-vision-based parking detection.
7. Demonstrate integration of frontend, backend, API, data persistence, and hardware communication.

---

# 🧠 Learning Outcomes

This project demonstrates practical experience with:

* Python programming
* Flask web development
* REST APIs
* Frontend development
* JavaScript
* JSON data persistence
* Session-based authentication
* File handling
* Image uploading
* Client-server communication
* Arduino programming
* IoT system architecture
* Git and GitHub
* Modular software design

---

# 🚧 Limitations

The current implementation has several limitations:

* JSON is used instead of a production database.
* Authentication is basic.
* The administrator password is stored in source code.
* The system currently relies on simulated occupancy unless hardware integration is configured.
* Flask development server should not be used for production deployment.
* No automatic vehicle detection is currently implemented.
* No payment system is currently implemented.

These limitations provide clear directions for future development.

---

# 👨‍💻 Author

**Priyanshu Gairola**

GitHub:

https://github.com/Priyanshugairola-9

Project Repository:

https://github.com/Priyanshugairola-9/SmartPark-Parking-Management-System
