const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const app = express();
const { User } = require("./db/mongo");
const { books } = require("./db/books");

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.send("hello");
});
app.post("/api/auth/signup", signUp);
app.post("/api/auth/login", logUser);
app.get("/api/books", getBooks);

app.use("/uploads", express.static("uploads"));

//getBooks
function getBooks(req, res) {
  res.send(books);
}

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
  const user = {
    email: email,
    password: hashPassword(password),
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
  if (!isPasswordCorrect(req.body.password, passwordInDb)) {
    res.status(401).send("Wrong credentials (p)");
    return;
  }
  res.send({
    userId: userInDb._id,
    token: "aze123",
  });
}

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  console.log("hash: ", hash);
  return hash;
}

function isPasswordCorrect(password, hash) {
  return bcrypt.compareSync(password, hash);
}
