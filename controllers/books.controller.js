const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { upload } = require("../middlewares/multer");
const { Book } = require("../models/Book");

//postBooks
async function postBooks(req, res) {
  const file = req.file;
  const body = req.body;
  const parseBook = body.book;
  const book = JSON.parse(parseBook);
  const filename = req.file.filename;
  book.imageUrl = filename;
  try {
    const result = await Book.create(book);
    res.send({ message: "Book posted", book: result });
  } catch (e) {
    console.error(e);
    res.status(500).send("Wrong things ! " + e.message);
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
    console.log("Token payload:", payloadToken);
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

const booksRouter = express.Router();
booksRouter.get("/:id", getIdOfBook);
booksRouter.get("/", getBooks);
booksRouter.post("/", checkToken, upload.single("image"), postBooks);
booksRouter.delete("/:id", checkToken, deleteBook);
booksRouter.put("/:id", checkToken, upload.single("image"), putBooks);

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
