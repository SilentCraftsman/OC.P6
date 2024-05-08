const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now(); // Obtenir un timestamp unique
    const fileExtension = file.originalname.split(".").pop(); // Obtenir l'extension d'origine
    const fileName = `file-${timestamp}.${fileExtension}`; // Générer un nom de fichier unique

    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
});

module.exports = { upload };
