const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Učitaj service account fajl
const serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://fit-garden-26-default-rtdb.europe-west1.firebasedatabase.app/",
});

const db = admin.database();

const app = express();
const port = 3000;
app.use(express.json());

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman, server-to-server

    if (
      origin === "http://localhost:4200" ||
      origin == "https://e-garden-frontend.web.app"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

let senzori = {
  temperatura: 0,
  vlaga: 0,
  vlaznostTlaProcenat: 0,
  aktivnostArduina: 0,
};

// Dohvati temperaturu, vlagu i vlaznost tla
app.get("/senzori", async (req, res) => {
  const snapshot = await db.ref("iot").once("value");
  if (snapshot.exists()) {
    const data = snapshot.val();
    senzori.temperatura =
      data.temperatura > -100 && data.temperatura < 100
        ? data.temperatura
        : senzori.temperatura;
    senzori.vlaga =
      data.vlaga >= 0 && data.vlaga <= 100 ? data.vlaga : senzori.vlaga;
    senzori.vlaznostTlaProcenat =
      data.vlaga >= 0 && data.vlaga <= 100
        ? data.vlaznostTlaProcenat
        : senzori.vlaznostTlaProcenat;
    senzori.aktivnostArduina = data.aktivnostArduina;
    res.send(senzori);
  } else {
    res.send("Nema podataka :/");
  }
});

app.post("/pumpa", async (req, res) => {
  const pumpa = req.body.pumpa;
  if (pumpa === 1 || pumpa === 0) {
    await db.ref("pumpa").set(pumpa);
    console.log("Stanje pumpe: " + pumpa);
  }
  res.send({ message: "Pumpa primljena: ", pumpa });
});

app.listen(port, () => {
  console.log(`Server radi na http://localhost:${port}`);
});
