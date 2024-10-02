// Importation du modèle Book pour interagir avec la base de données
const Book = require('../models/book');
// Importation du module filesystem pour gérer les fichiers
const fs = require('fs');

// Fonction pour récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour récupérer les meilleurs livres (3 avec la meilleure note)
exports.bestBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Fonction pour récupérer un livre par son ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// Fonction pour créer un nouveau livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  // Création d'une instance de Book avec les données du livre
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, // Association du livre à l'utilisateur authentifié
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // Définition de l'URL de l'image
  });

  //Sauvegarde du livre dans la base de données
  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' })) // Envoi d'une confirmation avec le statut 201
    .catch((error) => res.status(400).json({ error })); // Gestion des erreurs en envoyant une réponse avec le statut 400
};

// Fonction pour modifier un livre existant
exports.modifyBook = (req, res, next) => {

  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;

  //Recherche du livre à modifier par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      //  Vérification si l'utilisateur a le droit de modifier le livre
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'Requête non autorisée' }); // Envoi d'une réponse avec le statut 403 si non autorisé
      } else {
        //  Mise à jour du livre
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id }) // Mise à jour avec les nouvelles données
          .then(() => res.status(200).json({ message: 'Livre modifié !' })) // Envoi d'une confirmation avec le statut 200
          .catch(error => res.status(401).json({ error })); // Gestion des erreurs en envoyant une réponse avec le statut 401
      }
    })
    .catch((error) => {
      res.status(400).json({ error }); // Gestion des erreurs (livre non trouvé) en envoyant une réponse avec le statut 400
    });
};

// Fonction pour supprimer un livre
exports.deleteBook = (req, res, next) => {
  //  Recherche du livre par ID
  Book.findOne({ _id: req.params.id })
    .then(book => {
      //  Vérification si l'utilisateur a le droit de supprimer le livre
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' }); // Envoi d'une réponse avec le statut 401 si non autorisé
      } else {
        // Récupération du nom du fichier image pour la suppression
        const filename = book.imageUrl.split('/images/')[1]; // Extraction du nom de fichier à partir de l'URL
        fs.unlink(`images/${filename}`, () => { //Suppression de l'image du système de fichiers
          //Suppression du livre de la base de données
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre supprimé !' })) // Envoi d'une confirmation avec le statut 200
            .catch(error => res.status(401).json({ error })); // Gestion des erreurs en envoyant une réponse avec le statut 401
        });
      }
    })
    .catch(error => res.status(500).json({ error })); // Gestion des erreurs en envoyant une réponse avec le statut 500
};

// Fonction pour noter un livre
exports.rateBook = (req, res, next) => {
  //Recherche du livre par ID
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // Vérification si l'utilisateur a déjà noté le livre
      if (book.ratings.some(rating => rating.userId === req.auth.userId)) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' }); // Envoi d'une réponse avec le statut 400 si déjà noté
      };

      // Création d'un nouvel objet de notation
      const newRating = {
        userId: req.auth.userId,
        grade: req.body.rating // Récupération de la note depuis le corps de la requête
      };

      // Ajout de la notation au tableau des notations
      book.ratings.push(newRating);
      console.log(book.ratings);

      //Calcul de la somme des notations
      const sumOfGrades = book.ratings.reduce((acc, currentValue) => acc + currentValue.grade, 0); // Somme des notes
      const nbOfRatings = book.ratings.length; // Nombre de notations
      console.log(nbOfRatings, 'numberOfRatings');

      // Calcul de la note moyenne
      book.averageRating = parseFloat((sumOfGrades / nbOfRatings).toFixed(1)); // Arrondissement de la note moyenne

      // Sauvegarde du livre avec la nouvelle note
      book.save()
        .then(() => res.status(200).json(book)) // Envoi du livre mis à jour
        .catch(error => res.status(500).json({ error })); // Gestion des erreurs en envoyant une réponse avec le statut 500
    })
    .catch(error => res.status(500).json({ error })); // Gestion des erreurs en envoyant une réponse avec le statut 500
};
