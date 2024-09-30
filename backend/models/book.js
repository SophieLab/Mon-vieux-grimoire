// Importation de Mongoose, une bibliothèque pour interagir avec MongoDB
const mongoose = require('mongoose');

// Définition du schéma pour les notations (ratings) des livres
const ratingSchema = mongoose.Schema({
  userId: { type: String, required: true }, // ID de l'utilisateur qui a attribué la note
  grade: { type: Number, required: true }, // Note attribuée par l'utilisateur
});

// Définition du schéma pour les livres
const bookSchema = mongoose.Schema({
  userId: { type: String, required: true }, // ID de l'utilisateur qui a ajouté le livre
  title: { type: String, required: true }, // Titre du livre
  author: { type: String, required: true }, // Auteur du livre
  imageUrl: { type: String, required: true }, // URL de l'image de couverture du livre
  year: { type: Number, required: true }, // Année de publication du livre
  genre: { type: String, required: true }, // Genre littéraire du livre
  ratings: [ratingSchema], // Tableau contenant les notations associées au livre
  averageRating: { type: Number, required: false }, // Note moyenne, optionnelle
});

// Exportation du modèle 'Book' basé sur le schéma bookSchema
module.exports = mongoose.model('Book', bookSchema);
