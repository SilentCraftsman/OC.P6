const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extends: true }));
app.use(express.static("uploads"));

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
  console.log("Le port est : " + PORT);
});
