#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>

// WiFi
#define WIFI_SSID "iSudar"
#define WIFI_PASSWORD "iSudar2020"

// Firebase
#define API_KEY "AIzaSyBp02hS1L35UZACn0GDXVL_PTQ4gT-bpNo"
#define DATABASE_URL "https://fit-garden-26-default-rtdb.europe-west1.firebasedatabase.app/"

// Firebase objekti
#define USER_EMAIL "esp@gmail.com"
#define USER_PASSWORD "12345678"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

int ledPin = D4;

unsigned long sendDataPrevMillis = 0;

void setup() {
   pinMode(ledPin, OUTPUT);

  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Spajanje na WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nWiFi spojen");

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("Firebase povezan");

    if (Firebase.RTDB.setInt(&fbdo, "/senzor/ledVrijednost", 1)) {
      Serial.println("Poslano u Firebase: " + String(1));
    } else {
      Serial.println("Greska: " + fbdo.errorReason());
    }
}

void loop() {

  if (Firebase.ready() && millis() - sendDataPrevMillis > 2000) {
    sendDataPrevMillis = millis();

    // Čitanje nazad
    int vrijednost = Firebase.RTDB.getInt(&fbdo, "/senzor/ledVrijednost");
    Serial.println("Procitano iz Firebase: " + String(fbdo.intData()));
    
    if(String(fbdo.intData()) == "1") {
       digitalWrite(ledPin, HIGH);
    }
    else {
      digitalWrite(ledPin, LOW);
    }
    
  }
}