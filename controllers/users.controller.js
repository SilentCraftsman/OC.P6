const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/User");

//Signup
async function signUp(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const newUser = {
    email,
    password: hashPassword(password),
  };

  try {
    await User.create(newUser);
    res.status(201).json({ message: "Inscription réussie !" });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ message: "L'email existe déjà." });
    }
    console.error("Erreur lors de la création de l'utilisateur:", e);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

//Login
async function logUser(req, res) {
  const body = req.body;
  const userInDb = await User.findOne({
    email: body.email,
  });
  if (userInDb == null) {
    res.status(401).send("Mauvais email !");
    return;
  }
  const passwordInDb = userInDb.password;
  if (!isPasswordCorrect(req.body.password, passwordInDb)) {
    res.status(401).send("Wrong credentials !");
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
  return hash;
}

function isPasswordCorrect(password, hash) {
  return bcrypt.compareSync(password, hash);
}

const usersRouter = express.Router();

usersRouter.post("/signup", signUp);
usersRouter.post("/login", logUser);

module.exports = { usersRouter };
