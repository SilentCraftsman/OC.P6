const express = require("express");
const cors = require("cors");
const { mongoose } = require("../db/mongo");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/images", express.static("uploads"));

module.exports = { app };
