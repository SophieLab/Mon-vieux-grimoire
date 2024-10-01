// Importation de Mongoose, une bibliothèque pour interagir avec MongoDB
const mongoose = require('mongoose');

// Définition du schéma pour les notations (ratings) des livres
const ratingSchema = mongoose.Schema({
  userId: { type: String, required: true }, // ID de l'utilisateur qui a attribué la note
  grade: { type: Number, required: true },   // Note attribuée par l'utilisateur, de type numérique
});

// Définition du schéma pour les livres
const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },  // ID de l'utilisateur qui a ajouté le livre, requis
  title: { type: String, required: true },    // Titre du livre, requis pour identifier le livre
  author: { type: String, required: true },   // Auteur du livre, requis pour fournir des informations sur l'œuvre
  imageUrl: { type: String, required: true }, // URL de l'image de couverture du livre, requise pour l'affichage visuel
  year: { type: Number, required: true },     // Année de publication du livre, requise pour situer le livre dans le temps
  genre: { type: String, required: true },     // Genre littéraire du livre, requis pour la classification
  ratings: [ratingSchema],                     // Tableau contenant les notations associées au livre, utilisant le schéma de notation défini précédemment
  averageRating: { type: Number, required: false }, // Note moyenne, optionnelle, calculée à partir des notations
});

// Exportation du modèle 'Book' basé sur le schéma bookSchema
module.exports = mongoose.model('Book', bookSchema);
