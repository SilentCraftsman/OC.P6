const mongoose = require("mongoose");
const PASSWORD = "0tydc7pDiX4gHR0q";
const USER = "ggambier72";
const DB_URL = `mongodb+srv://${USER}:${PASSWORD}@cluster0.uhqd0ba.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

async function connect() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connecter au DB");
  } catch (e) {
    console.log("error: ", e);
  }
}

connect();

module.exports = {};
