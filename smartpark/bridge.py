# bridge.py — Reads Arduino IR sensor data and updates the Flask web server
# Requirements: pip install pyserial requests
import serial, requests, time

SERIAL_PORT = 'COM3'        # Windows: COMx | Linux: /dev/ttyUSB0
BAUD_RATE   = 9600
SERVER_URL  = 'Enter your cloud server link'  # <-- THIS IS YOUR CLOUD SERVER
ADMIN_PASS  = '12345' # <-- CHANGE THIS TO YOUR ACTUAL ADMIN PASSWORD

# Step 1: Log in to get a session cookie
session = requests.Session()
resp = session.post(f'{SERVER_URL}/api/admin/login',
                    json={'password': ADMIN_PASS})
print('Login:', resp.json())

# Step 2: Open the serial port
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2)
print(f'IR Bridge ready on {SERIAL_PORT} at {BAUD_RATE} baud')

# Step 3: Read IR sensor events and forward to Flask
while True:
    try:
        line = ser.readline().decode('utf-8', errors='ignore').strip()
        if not line or not line.startswith('TOGGLE:'):
            continue
        _, spot_id, status = line.split(':')
        r = session.post(f'{SERVER_URL}/api/admin/toggle/{spot_id}')
        state = 'OCCUPIED' if status == '1' else 'AVAILABLE'
        print(f'  IR -> {spot_id} -> {state} [{r.status_code}]')
    except KeyboardInterrupt:
        print('Bridge stopped.'); break
    except Exception as e:
        print('Error:', e); time.sleep(1)
