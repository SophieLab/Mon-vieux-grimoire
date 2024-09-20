const Book = require('../models/book');
const fs = require('fs'); // Importation du module filesystem pour gérer les fichiers

// Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books)) // Envoie la liste des livres en réponse
    .catch((error) => res.status(400).json({ error })); // Gère les erreurs
};

// Récupérer les meilleurs livres (3 avec la meilleure note)
exports.bestBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Trie par note moyenne, du plus élevé au plus bas
    .limit(3) // Limite à 3 résultats
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Récupérer un livre par son ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }) // Recherche le livre par ID
    .then((book) => res.status(200).json(book)) // Envoie le livre en réponse
    .catch((error) => res.status(404).json({ error })); // Gère les erreurs (livre non trouvé)
};

// Créer un nouveau livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book); // Parse le corps de la requête pour obtenir les données du livre
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, // Associe le livre à l'utilisateur authentifié
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // Définit l'URL de l'image
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' })) // Envoie une confirmation
    .catch((error) => res.status(400).json({ error }));
};

// Modifier un livre existant
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId; // Supprime l'ID utilisateur

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'Requête non autorisée' }); // Vérifie si l'utilisateur a le droit de modifier le livre
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id }) // Met à jour le livre
        .then(() => res.status(200).json({ message: 'Livre modifié !' })) // Envoie une confirmation
        .catch(error => res.status(401).json({ error })); // Gère les erreurs
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }) // Recherche le livre par ID
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' }); // Vérifie si l'utilisateur a le droit de supprimer le livre
      } else {
        const filename = book.imageUrl.split('/images/')[1]; // Récupère le nom du fichier image
        fs.unlink(`images/${filename}`, () => { // Supprime l'image du système de fichiers
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => res.status(500).json({ error }));
};

// Noter un livre
exports.rateBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.ratings.some(rating => rating.userId === req.auth.userId)) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      };

      const newRating = {
        userId: req.auth.userId,
        grade: req.body.rating // Crée un nouvel objet de notation
      };

      book.ratings.push(newRating); // Ajoute la notation au tableau des notations
      console.log(book.ratings);

      const sumOfGrades = book.ratings.reduce((acc, currentValue) => acc + currentValue.grade, 0); // Calcule la somme des notations
      const nbOfRatings = book.ratings.length; // Compte le nombre de notations
      console.log(nbOfRatings, 'numberOfRatings');

      book.averageRating = parseFloat((sumOfGrades / nbOfRatings).toFixed(1)); // Calcule et arrondit la note moyenne

      book.save()
        .then(() => res.status(200).json(book)) // Envoie le livre mis à jour
        .catch(error => res.status(500).json({ error })); // Gère les erreurs
    })
    .catch(error => res.status(500).json({ error })); // Gère les erreurs
};
