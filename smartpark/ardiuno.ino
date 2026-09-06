/*
 * SmartPark Parking Management System — Arduino UNO Firmware (Modified for 2 Sensors)
 * Version B: USB Serial Bridge
 * Sensor: TCRT5000 IR Reflective Sensor (x2)
 * Logic: OUT pin LOW = car present (occupied)
 *        OUT pin HIGH = no car (available)
 */

// ── Pin Definitions ──────────────────
const int IR_PIN[2] = {2, 3};  // S1, S2      --Spots

// ── Spot IDs ────────────────────────
const char* SPOT_IDS[2] = {
  "spot_1777259343885",  // S1   --spot 1
  "spot_1777259344678"   // S2  --spot 2
};

const int POLL_MS = 500;   // check sensors every 500ms
bool prevOccupied[2] = {false, false};

// ── setup() ─────────────────────────
void setup() {
  Serial.begin(9600);

  for (int i = 0; i < 2; i++) {
    pinMode(IR_PIN[i], INPUT);
  }

  Serial.println("READY");
}

// ── loop() ──────────────────────────
void loop() {
  for (int i = 0; i < 2; i++) {                // for loop for only 2 spots 
    // LOW = car detected
    bool occupied = (digitalRead(IR_PIN[i]) == LOW);

    if (occupied != prevOccupied[i]) {
      Serial.print("TOGGLE:");
      Serial.print(SPOT_IDS[i]);
      Serial.print(":");
      Serial.println(occupied ? "1" : "0");  // 1=occupied, 0=free

      prevOccupied[i] = occupied;
    }
  }

  delay(POLL_MS);
}
