const { app } = require("./config/app");
const { usersRouter } = require("./controllers/users.controller");
const { booksRouter } = require("./controllers/books.controller");

const PORT = process.env.PORT || 4000;

app.get("/", function (req, res) {
  res.send("Server running !");
});

app.use("/api/auth", usersRouter);
app.use("/api/books", booksRouter);

app.listen(PORT, function () {
  console.log("Le port est : " + PORT);
});

// Supprime les User dans mongoDB
/*
const { User } = require("./models/User");
if (User) {
  User.deleteMany({})
    .then(() => console.log("Supprime les users !"))
    .catch((err) =>
      console.error("Erreur lors de la suppression des users", err)
    );
} else {
  console.error("Le modèle User n'est pas défini");
}
*/

// Supprime les Books dans mongoDB
/*
const { Book } = require("./models/Book");
if (Book) {
  Book.deleteMany({})
    .then((resultat) => {
      console.log(`Supprimé ${resultat.deletedCount} livre(s)`);
    })
    .catch((err) => {
      console.error("Erreur lors de la suppression des livres :", err);
    });
} else {
  console.error(
    "Le modèle Book n'est pas défini. Veuillez vérifier votre importation."
  );
}
*/
