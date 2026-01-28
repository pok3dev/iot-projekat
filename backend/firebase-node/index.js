const admin = require("firebase-admin");
const express = require("express");

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

app.get("/led", async (req, res) => {
  const snapshot = await db.ref("senzor/ledVrijednost").once("value");
  res.send(`LED value je: ${snapshot.val()}`);
});

app.get("/led/toggle", async (req, res) => {
  const current = (await db.ref("senzor/ledVrijednost").once("value")).val();
  const ref = db.ref("senzor/ledVrijednost");
  await ref.set(current == 1 ? 0 : 1);
  res.send(`LED value je sada: ${current == 1 ? 0 : 1}`);
});

app.listen(port, () => {
  console.log(`Server radi na http://localhost:${port}`);
});
