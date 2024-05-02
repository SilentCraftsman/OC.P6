const books = [
  {
    userId: "1", // ID unique de l'utilisateur
    title: "My Life, My Work", // Titre du livre
    author: "Henry Ford", // Auteur du livre
    imageUrl: "http://localhost:4000/uploads/my.png", // URL de l'image de couverture
    year: 1915, // Année de publication
    genre: "Biographie", // Genre du livre
    ratings: [
      {
        userId: "1", // ID unique de l'utilisateur qui a noté
        grade: 3, // Note donnée au livre
      },
    ],
    averageRating: 3, // Note moyenne du livre
  },
];

// Exportation du tableau de livres
module.exports = { books };
