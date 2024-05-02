require("dotenv").config();
const mongoose = require("mongoose");

const DB_URL = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.DB_DOMAIN}`;

async function connect() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connecter au DB");
  } catch (e) {
    console.log("error: ", e);
  }
}

connect();

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);
const joe = new User({
  email: "cmlljosselin@gmail.com",
  password: "123",
});
joe.save().then(() => console.log("joe saved"));

module.exports = { User };
