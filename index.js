const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.send("hello");
});

app.post("/api/auth/signup", signUp);

app.listen(PORT, function () {
  console.log("Le port est : " + PORT);
});

function signUp(req, res) {
  const body = req.body;
  console.log(body);
}
