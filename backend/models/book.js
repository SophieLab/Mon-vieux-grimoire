const mongoose = require('mongoose');

// Définition du schéma pour les notations (ratings) des livres
const ratingSchema = mongoose.Schema({
  userId: { type: String, required: true }, // ID de l'utilisateur qui a attribué la note
  grade: { type: Number, required: true },   // Note attribuée par l'utilisateur, de type numérique
});

// Définition du schéma pour les livres
const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [ratingSchema], // Liste des notations
  averageRating: { type: Number, default: 0 }, // Note moyenne, par défaut à 0
});

// Exportation du modèle 'Book' basé sur le schéma bookSchema
module.exports = mongoose.model('Book', bookSchema);
