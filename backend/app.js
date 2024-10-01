// Étape 1 : Importation des modules nécessaires
const express = require('express'); // Framework pour créer des applications web
const mongoose = require('mongoose'); // ODM pour interagir avec MongoDB
const path = require('path'); // Module pour gérer les chemins de fichiers
const bookRoutes = require('./routes/book'); // Routes pour les opérations liées aux livres
const userRoutes = require('./routes/user'); // Routes pour les opérations liées aux utilisateurs
require('dotenv').config(); // Chargement des variables d'environnement depuis un fichier .env

// Étape 2 : Création d'une instance de l'application Express
const app = express();

// Étape 3 : Connexion à la base de données MongoDB
mongoose.connect(
  process.env.MONGO_URI // URI de la base de données MongoDB depuis les variables d'environnement
)
  .then(() => console.log('Connexion à MongoDB réussie !')) // Confirmation de la connexion réussie
  .catch(() => console.log('Connexion à MongoDB échouée !')); // Gestion des erreurs de connexion

// Étape 4 : Middleware pour parser les requêtes JSON
app.use(express.json()); // Permet de traiter le corps des requêtes au format JSON

// Étape 5 : Middleware pour configurer les en-têtes CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permet toutes les origines pour les requêtes CORS
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // Autorise certains en-têtes
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Autorise certaines méthodes HTTP
  next(); // Passe au middleware suivant
});

// Étape 6 : Définition des routes de l'application
app.use('/api/books', bookRoutes); // Routes pour les livres
app.use('/api/auth', userRoutes); // Routes pour l'authentification des utilisateurs

// Étape 7 : Configuration pour servir des fichiers statiques (images)
app.use('/images', express.static(path.join(__dirname, 'images'))); // Servir les fichiers d'images depuis le répertoire 'images'

// Étape 8 : Exportation de l'application pour être utilisée ailleurs
module.exports = app; // Permet d'utiliser l'application dans d'autres fichiers
