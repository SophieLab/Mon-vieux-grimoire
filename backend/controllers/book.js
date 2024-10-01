// Importation du modèle Book pour interagir avec la base de données
const Book = require('../models/book'); 
// Importation du module filesystem pour gérer les fichiers
const fs = require('fs'); 

// Fonction pour récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find() // Étape 1 : Récupération de tous les livres
    .then((books) => res.status(200).json(books)) // Étape 2 : Envoi de la liste des livres en réponse avec le statut 200
    .catch((error) => res.status(400).json({ error })); // Étape 3 : Gestion des erreurs en envoyant une réponse avec le statut 400
};

// Fonction pour récupérer les meilleurs livres (3 avec la meilleure note)
exports.bestBooks = (req, res, next) => {
  Book.find() // Étape 1 : Récupération de tous les livres
    .sort({ averageRating: -1 }) // Étape 2 : Tri des livres par note moyenne, du plus élevé au plus bas
    .limit(3) // Étape 3 : Limite à 3 résultats
    .then(books => res.status(200).json(books)) // Étape 4 : Envoi des meilleurs livres en réponse avec le statut 200
    .catch(error => res.status(400).json({ error })); // Étape 5 : Gestion des erreurs en envoyant une réponse avec le statut 400
};

// Fonction pour récupérer un livre par son ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }) // Étape 1 : Recherche du livre par ID
    .then((book) => res.status(200).json(book)) // Étape 2 : Envoi du livre trouvé en réponse avec le statut 200
    .catch((error) => res.status(404).json({ error })); // Étape 3 : Gestion des erreurs (livre non trouvé) en envoyant une réponse avec le statut 404
};

// Fonction pour créer un nouveau livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book); // Étape 1 : Parsing du corps de la requête pour obtenir les données du livre
  delete bookObject._id; // Étape 2 : Suppression de l'ID s'il est présent
  delete bookObject._userId; // Étape 3 : Suppression de l'ID utilisateur pour éviter toute modification non autorisée

  // Étape 4 : Création d'une instance de Book avec les données du livre
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, // Association du livre à l'utilisateur authentifié
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // Définition de l'URL de l'image
  });

  // Étape 5 : Sauvegarde du livre dans la base de données
  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' })) // Envoi d'une confirmation avec le statut 201
    .catch((error) => res.status(400).json({ error })); // Gestion des erreurs en envoyant une réponse avec le statut 400
};

// Fonction pour modifier un livre existant
exports.modifyBook = (req, res, next) => {
  // Étape 1 : Création d'un objet bookObject avec les données du livre et éventuellement l'URL de l'image
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // Si un fichier est fourni, on définit l'URL de l'image
  } : { ...req.body }; // Sinon, on prend simplement le corps de la requête

  delete bookObject._userId; // Étape 2 : Suppression de l'ID utilisateur pour éviter toute modification non autorisée

  // Étape 3 : Recherche du livre à modifier par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Étape 4 : Vérification si l'utilisateur a le droit de modifier le livre
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'Requête non autorisée' }); // Envoi d'une réponse avec le statut 403 si non autorisé
      } else {
        // Étape 5 : Mise à jour du livre
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
  // Étape 1 : Recherche du livre par ID
  Book.findOne({ _id: req.params.id }) 
    .then(book => {
      // Étape 2 : Vérification si l'utilisateur a le droit de supprimer le livre
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' }); // Envoi d'une réponse avec le statut 401 si non autorisé
      } else {
        // Étape 3 : Récupération du nom du fichier image pour la suppression
        const filename = book.imageUrl.split('/images/')[1]; // Extraction du nom de fichier à partir de l'URL
        fs.unlink(`images/${filename}`, () => { // Étape 4 : Suppression de l'image du système de fichiers
          // Étape 5 : Suppression du livre de la base de données
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
  // Étape 1 : Recherche du livre par ID
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // Étape 2 : Vérification si l'utilisateur a déjà noté le livre
      if (book.ratings.some(rating => rating.userId === req.auth.userId)) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' }); // Envoi d'une réponse avec le statut 400 si déjà noté
      };

      // Étape 3 : Création d'un nouvel objet de notation
      const newRating = {
        userId: req.auth.userId,
        grade: req.body.rating // Récupération de la note depuis le corps de la requête
      };

      // Étape 4 : Ajout de la notation au tableau des notations
      book.ratings.push(newRating); 
      console.log(book.ratings);

      // Étape 5 : Calcul de la somme des notations
      const sumOfGrades = book.ratings.reduce((acc, currentValue) => acc + currentValue.grade, 0); // Somme des notes
      const nbOfRatings = book.ratings.length; // Nombre de notations
      console.log(nbOfRatings, 'numberOfRatings');

      // Étape 6 : Calcul de la note moyenne
      book.averageRating = parseFloat((sumOfGrades / nbOfRatings).toFixed(1)); // Arrondissement de la note moyenne

      // Étape 7 : Sauvegarde du livre avec la nouvelle note
      book.save()
        .then(() => res.status(200).json(book)) // Envoi du livre mis à jour
        .catch(error => res.status(500).json({ error })); // Gestion des erreurs en envoyant une réponse avec le statut 500
    })
    .catch(error => res.status(500).json({ error })); // Gestion des erreurs en envoyant une réponse avec le statut 500
};
