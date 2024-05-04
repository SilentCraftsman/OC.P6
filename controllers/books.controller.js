const express = require("express");
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

const booksRouter = express.Router();
booksRouter.get("/", getBooks);
booksRouter.post("/", upload.single("image"), postBooks);

module.exports = { booksRouter };
