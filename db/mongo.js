const mongoose = require("mongoose");
const PASSWORD = "CLF0LmTm9";
const USER = "ggambier72";
const DB_URL = `mongodb+srv://${USER}:${PASSWORD}@cluster0.lx6u230.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
