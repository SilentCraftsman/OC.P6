const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(cors());

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
  console.log("Le port est : " + PORT);
});
