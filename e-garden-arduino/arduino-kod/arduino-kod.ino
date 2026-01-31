int pumpaPin = 10;

void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    byte upaliPumpu = Serial.read();
    if(upaliPumpu == 1) {
      digitalWrite(pumpaPin, HIGH);
    } else {
      digitalWrite(pumpaPin, LOW);
    }
  }
}
