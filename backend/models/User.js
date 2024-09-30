// Importation de Mongoose, une bibliothèque pour interagir avec MongoDB
const mongoose = require('mongoose');
// Importation du plugin unique-validator pour assurer l'unicité des valeurs dans les champs
const uniqueValidator = require('mongoose-unique-validator');

// Définition du schéma pour les utilisateurs
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Adresse e-mail de l'utilisateur, requise et doit être unique
  password: { type: String, required: true }, // Mot de passe de l'utilisateur, requis
});

// Application du plugin uniqueValidator au schéma pour garantir l'unicité de l'e-mail
userSchema.plugin(uniqueValidator);

// Exportation du modèle 'User' basé sur le schéma userSchema
module.exports = mongoose.model('User', userSchema);
