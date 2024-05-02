const express = require("express");
const cors = require("cors");
const app = express();
const { User } = require("./db/mongo");

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.send("hello");
});

app.post("/api/auth/signup", signUp);
app.post("/api/auth/login", logUser);

app.listen(PORT, function () {
  console.log("Le port est : " + PORT);
});

//Signup
async function signUp(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const userInDb = await User.findOne({
    email: email,
  });
  console.log(userInDb);
  const user = {
    email: email,
    password: password,
  };
  try {
    await User.create(user);
  } catch (e) {
    console.log("error :", e);
    res.status(500).send("Quelque chose de bizarre !");
    return;
  }
  if (userInDb != null) {
    res.status(400).send("L'email existe déjà !");
    return;
  }
  res.send("Sign-up successful");
}

//Login
async function logUser(req, res) {
  const body = req.body;
  const userInDb = await User.findOne({
    email: body.email,
  });
  if (userInDb == null) {
    res.status(401).send("Mauvais email");
    return;
  }
  const passwordInDb = userInDb.password;
  if (passwordInDb != body.password) {
    res.status(401).send("Wrong credentials (p)");
    return;
  }
  res.send({
    userId: userInDb._id,
    token: "aze123",
  });
}
