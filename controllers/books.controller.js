const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const { upload } = require("../middlewares/multer");
const { Book } = require("../models/Book");

const booksRouter = express.Router();
booksRouter.get("/bestrating", getBestRating);
booksRouter.get("/:id", getIdOfBook);
booksRouter.get("/", getBooks);
booksRouter.post("/", checkToken, upload.single("image"), postBooks);
booksRouter.delete("/:id", checkToken, deleteBook);
booksRouter.put("/:id", checkToken, upload.single("image"), putBooks);
booksRouter.post("/:id/rating", checkToken, postRating);

//postRating
async function postRating(req, res) {
  const id = req.params.id;
  if (id == null || id == "undefined") {
    res.status(400).send("Book id is missing");
    return;
  }
  const rating = req.body.rating;
  const userId = req.payloadToken.userId;
  try {
    const book = await Book.findById(id);
    if (book == null) {
      res.status(404).send("Book not found");
      return;
    }
    const ratingsInDb = book.ratings;
    const previousRatingFromCurrentUser = ratingsInDb.find(
      (rating) => rating.userId == userId
    );
    if (previousRatingFromCurrentUser != null) {
      res.status(400).send("You have already rated this book");
      return;
    }
    const newRating = { userId, grade: rating };
    ratingsInDb.push(newRating);
    book.averageRating = calculateAverageRating(ratingsInDb);
    await book.save();
    res.status(200).json({
      message: "Rating posted successfully",
      book, // Renvoyez le livre mis à jour
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong:" + e.message);
  }
}

function calculateAverageRating(ratings) {
  const sumOfAllGrades = ratings.reduce((sum, rating) => sum + rating.grade, 0);
  return sumOfAllGrades / ratings.length;
}
function calculateAverageRating(ratings) {
  const sumOfAllGrades = ratings.reduce((sum, rating) => sum + rating.grade, 0);
  return sumOfAllGrades / ratings.length;
}

//getBestRating
async function getBestRating(req, res) {
  try {
    const bookWithBestRatings = await Book.find().sort({ rating: -1 });

    bookWithBestRatings.forEach((book) => {
      book.imageUrl = getPathImageUrl(book.imageUrl);
    });

    res.json(bookWithBestRatings); // Utilisez res.json pour envoyer des données JSON
  } catch (error) {
    console.error("Error fetching books with best ratings:", error);
    res.status(500).json({ error: "Something went wrong: " + error.message });
  }
}

// Fonction pour convertir une image
async function convertImage(filename) {
  const maxDimension = 300;
  const outputFilename = `webp-${filename}`;
  const outputPath = `uploads/${outputFilename}`;

  try {
    await sharp(`uploads/${filename}`)
      .resize({
        width: maxDimension, // Redimensionne la largeur si elle est supérieure à maxDimension
        height: maxDimension, // Redimensionne la hauteur si elle est supérieure à maxDimension
        fit: sharp.fit.inside, // Assure que l'image reste dans les limites
        withoutEnlargement: true, // Évite d'agrandir les petites images
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    return outputFilename;
  } catch (error) {
    console.error("Error converting image:", error);
    throw new Error("Conversion to WebP failed");
  }
}

// Contrôleur pour ajouter un nouveau livre
async function postBooks(req, res) {
  const file = req.file;
  if (!file) {
    res.status(400).send("No file uploaded");
    return;
  }

  try {
    const optimizedFilename = await convertImage(file.filename); // Récupérez le nom du fichier converti

    const book = {
      ...JSON.parse(req.body.book),
      imageUrl: optimizedFilename,
    };

    const result = await Book.create(book); // Créez le livre avec le bon nom de fichier

    res.send({ message: "Book posted", book: result });
  } catch (e) {
    console.error("Error while posting book:", e);
    res.status(500).send("An error occurred while posting the book.");
  }
}

//getBooks
async function getBooks(req, res) {
  try {
    const booksinDB = await Book.find();
    booksinDB.forEach((books) => {
      books.imageUrl = getPathImageUrl(books.imageUrl);
    });
    res.send(booksinDB);
  } catch (e) {
    console.error("Erreur lors de la récupération des livres :", e);
    res.status(500).send("Erreur interne du serveur");
  }
}

function getPathImageUrl(filename) {
  return process.env.HOST_URL + "/" + process.env.IMAGES_PATH + "/" + filename;
}

//getIdOfBook
async function getIdOfBook(req, res) {
  try {
    const id = req.params.id;

    // Vérifiez si l'ID est valide pour MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).send("Invalid book ID");
      return;
    }

    const book = await Book.findById(id);

    if (!book) {
      res.status(404).send("Book not found");
      return;
    }

    book.imageUrl = getPathImageUrl(book.imageUrl);

    res.json(book);
  } catch (error) {
    // Gérer les exceptions générales
    console.error("Error fetching book:", error);
    res.status(500).send("Internal server error");
  }
}

//checkToken
function checkToken(req, res, next) {
  const authorization = req.headers.authorization;

  const token = authorization.split(" ")[1]; // Récupérer le token après "Bearer "
  const jwtSecret = String(process.env.JWT_SECRET);

  try {
    const payloadToken = jwt.verify(token, jwtSecret); // Vérifier le token
    if (payloadToken == null) {
      res.status(401).send("Unauthorized !");
      return;
    }
    req.payloadToken = payloadToken;
    req.user = payloadToken; // Passer le payload à la requête
    next(); // Passer au middleware ou contrôleur suivant
  } catch (e) {
    console.error("JWT verification error:", e);
    return res.status(401).send("Invalid or expired token");
  }
}

//putBooks
async function putBooks(req, res) {
  try {
    const bookId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: "Invalid book ID." });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    // Vérifiez si l'utilisateur qui fait la demande est le propriétaire du livre
    const bookOwnerId = book.userId;
    const requestUserId = req.payloadToken.userId;

    if (bookOwnerId !== requestUserId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to update this book." });
    }

    // Préparation des données mises à jour
    const updatedBookData = {};

    if (req.body.title) updatedBookData.title = req.body.title;
    if (req.body.author) updatedBookData.author = req.body.author;
    if (req.body.year) updatedBookData.year = req.body.year;
    if (req.body.price) updatedBookData.price = req.body.price;

    if (req.file) {
      updatedBookData.imageUrl = req.file.filename; // Utiliser le fichier téléchargé pour l'image
    }

    // Mise à jour du livre
    const updatedBook = await Book.findByIdAndUpdate(bookId, updatedBookData, {
      new: true,
    });

    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found." });
    }

    res.status(200).json({
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the book." });
  }
}

//deleteBook
async function deleteBook(req, res) {
  try {
    const bookId = req.params.id;

    if (!bookId) {
      res.status(400).json({ error: "Book ID is required." });
      return;
    }

    const bookDb = await Book.findByIdAndDelete(bookId);

    if (!bookDb) {
      res.status(404).json({ error: "Book not found." });
      return;
    }

    const bookOwnerId = bookDb.userId;
    const requestUserId = req.payloadToken.userId;

    if (bookOwnerId !== requestUserId) {
      res.status(403).json({ error: "You cannot delete other books!" });
      return;
    }

    res.status(200).json({ message: "Book deleted successfully." });
  } catch (e) {
    console.error("Error deleting book:", e);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the book." });
  }
}

module.exports = { booksRouter };
