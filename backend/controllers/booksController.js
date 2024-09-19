const Book = require("../models/bookModel");
const fs = require("fs");
const mongoose = require('mongoose');
const path = require("path");

//- GET : Récupération de tous les livres

exports.getAllBooks = async (req, res) => {
  //-Le but est ici de renvoyer un tableau avec tous les livres de la base de données
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error });
  }
};

//- POST : Création d'un livre

exports.createBook = async (req, res) => {
  if (!req.body.book || req.body.book === undefined || req.file === undefined) {
    return res.status(400).json({ error: "Les données du livre ne sont pas valides" });
  }
  //-On stocke la requête demandée sous format JSON
  const bookObject = JSON.parse(req.body.book);
  //-On supprime le mauvais _id venant du front
  delete bookObject._id;
  //-On supprime le "_userId" à qui on ne peut pas faire confiance
  delete bookObject._userId;
  //-On créée l'instance "create" avec le modèle "Book"
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  //-On enregistre le livre créé dans la base de données
  try {
    await book.save();
    res.status(201).json({ message: "Livre enregistré avec succès !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

//- GET : Récupération d'un livre

exports.getOneBook = async (req, res) => {

  //-On vérifie si l'ID du livre est valide
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Paramètre invalide !" });
  }
  
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (book === null) {
      return res.status(404).json({ error: "Ce livre n'existe pas" });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ error: "Ce livre n'existe pas" });
  }
};

//- PUT : Modification d'un livre

exports.modifyBook = async (req, res) => {

  //-On vérifie que l'ID donné est valide
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Paramètre invalide !" });
  }

  if ( req.body.book === undefined && req.file === undefined && Object.keys(req.body).length === 0
  ) {
    return res.status(400).json({ error: "Les modifications ne sont pas valides" });
  }

  const bookObject = req.file
    ? {
        //-On stocke une nouvelle fois la requête demandée au format JSON
        ...JSON.parse(req.body.book || "{}"),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;

  //-On vérifie si les données entrées sont valides
  if (typeof bookObject.genre != 'string' || isNaN(bookObject.year)) {
    return res.status(400).json({ error: "Les données fournies sont invalides" });
  }

  //-On recherche le livre demandé dans la base de données à l'aide de son ID
  try {
    const book = await Book.findOne({ _id: req.params.id });
    //-On vérifie que le livre existe bien dans la base de données
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé !" });
    }

    //-Si le livre existe bien, on vérifie les autorisations de l'utilisateur connecté pour savoir si il peut modifier le livre choisi
    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: "Requête non autorisée !" });
    }

    //-Une fois les autorisations vérifiées, on sauvegarde les nouvelles informations du livre
    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id }
    );

    if (!req.file) {
      return res.status(200).json({ message: "Livre modifié avec succès !" });
    }

    const filename = book.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, () => {
      res.status(200).json({ message: "Livre modifié avec succès !" });
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

//- DELETE : Supression d'un livre

exports.deleteBook = async (req, res) => {
  //-On vérifie que l'ID du book est valide
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Paramètre invalide !" });
  }
  //-On recherche à nouveau le livre demandé dans la base de données à l'aide de son ID
  try {
    const book = await Book.findOne({ _id: req.params.id });
    //-Si le livre n'est pas trouvé on renvoie une erreur 404
    if (!book) {
      return res.status(404).json({ error: "Ce livre n'existe pas" });
    }
    //-On vérifie les autorisations de l'utilisateur connecté pour savoir si il peut supprimer le livre choisi
    if (book.userId != req.auth.userId) {
      return res.status(403).json({ message: "Requête non autorisée !" });
    }

    const filename = book.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, async () => {
      //-Une fois les autorisations vérifiées, on supprime le livre
      try {
        await Book.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Livre supprimé avec succès !" });
      } catch (error) {
        res.status(400).json({ error: "Impossible de supprimer ce livre" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de la note du livre." });
  }
};

//- GET : Obtenir les 3 livres ayant la meilleure note

exports.bestRatings = async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    if (books.length === 0) {
      //-Si on a pas de livres dans la base de données, on renvoie une erreur 404
      return res.status(404).json({ error: "Aucun livre trouvé" });
    }
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error });
  }
};

//- POST : Mettre une note au livre et en calculer la moyenne

exports.bookRating = async (req, res) => {
  const { rating, userId } = req.body;

    //-On vérifie si l'ID du livre est valide
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Paramètre invalide !" });
    }
  //-On vérifie si le livre est présent dans la base de données
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      res.status(404).json({ error: "Aucun livre n'a été trouvé" });
    }

    //-On vérifie si l'utilisateur a déjà noté ce livre
    for (let userRate of book.ratings) {
      if (userRate.userId == userId) {
        return res.status(409).json({ error: "L'utilisateur a déjà noté ce livre." });
      }
    }

    //-On vérifie si le userId de l'utilisateur entré est le bon
    if (req.auth.userId != userId) {
      return res.status(400).json({ error: "Requête invalide !" });
    }

    //-On vérifie si la note entrée est correcte
    if (rating < 0 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ error: "La note n'est pas valide" });
    }
    //-On ajoute la note à l'array rating
    book.ratings.push({
      grade: rating,
      userId: req.auth.userId,
    });
    //-On calcule la somme des notes, puis de la moyenne
    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce(
      (sum, rating) => sum + rating.grade,
      0
    );
    const averageRating = sumRatings / totalRatings;

    //-On met à jour la moyenne des notes dans le livre
    book.averageRating = averageRating;

    //-On sauvegarde les modifications dans la base de données
    const updatedBook = await book.save();
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la notation du livre" });
  }
};