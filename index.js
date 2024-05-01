const express = require("express");

const app = express();

const PORT = process.env.PORT || 4000;

app.get("/", function (req, res) {
  res.send("hello");
});

app.listen(PORT, function () {
  console.log("Le port est : " + PORT);
});
