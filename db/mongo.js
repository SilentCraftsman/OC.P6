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

const BookSchema = new mongoose.Schema({
  userId: String,
  title: String,
  author: String,
  imageUrl: String,
  year: Number,
  genre: String,
  ratings: [
    {
      userId: String,
      grade: Number,
    },
  ],
  averageRating: Number,
});

const Book = mongoose.model("Book", BookSchema);

module.exports = { User, Book }; // Exportez les deux modèles ensemble
