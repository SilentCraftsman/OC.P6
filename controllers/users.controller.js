const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/User");

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
    token: generateToken(userInDb._id),
  });
}

function generateToken(userData) {
  const payload = {
    userId: userData,
  };
  const jwtSecret = String(process.env.JWT_SECRET);
  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: "1d",
  });
  return token;
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

const usersRouter = express.Router();

usersRouter.post("/signup", signUp);
usersRouter.post("/login", logUser);

module.exports = { usersRouter };
