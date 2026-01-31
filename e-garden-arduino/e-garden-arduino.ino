#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include "time.h"

const char* ntpServer = "pool.ntp.org";

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

#define DHTPIN D2        // Pin za DHT11
#define DHTTYPE DHT11   // Tip senzora

DHT dht(DHTPIN, DHTTYPE);

const int soilPin = A0; // Analogni pin za soil moisture

unsigned long sendDataPrevMillis = 0;

void setup() {
  Serial.begin(9600);
  dht.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Spajanje na WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nWiFi spojen");
  configTime(0, 0, ntpServer); 

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("Firebase povezan");
}

void loop() {

  if (Firebase.ready() && millis() - sendDataPrevMillis > 3000) {
      sendDataPrevMillis = millis();
      // Ping mehanizam 
      time_t now = time(nullptr);
      Firebase.RTDB.setInt(&fbdo, "/iot/aktivnostArduina", now);

      // Čitanje DHT11
      float temperatura = round(dht.readTemperature());
      float vlaznostZraka = round(dht.readHumidity());

      // Čitanje vlaznosti tla
      int vlaznostTla = analogRead(soilPin);
      Serial.println(temperatura);

      // Pretvaranje vlaznosti tla u procenat
      int vlaznostTlaProcenat = map(vlaznostTla, 1023, 0, 0, 100);
      if (isnan(vlaznostZraka) || isnan(temperatura)) {
        Serial.println("Greska pri citanju DHT11!");
      }else if (isnan(vlaznostTla)) {
        Serial.println("Greska pri citanju senzora vlage tla!");
      }
       else {
        Firebase.RTDB.setInt(&fbdo, "/iot/temperatura", temperatura);
        Firebase.RTDB.setInt(&fbdo, "/iot/vlaga", vlaznostZraka);
        Firebase.RTDB.setInt(&fbdo, "/iot/vlaznostTlaProcenat", vlaznostTlaProcenat);

        if(Firebase.RTDB.getInt(&fbdo, "/pumpa")){
          Serial.println("Ukljucena pumpa: "+ String(fbdo.intData()));
          Serial.println(fbdo.intData());
          Serial.write(fbdo.intData());
        }


      }
      }
}





