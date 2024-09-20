const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
require('dotenv').config()
// console.log(process.env) // remove this after you've confirmed it is working

const app = express();

// Connexion à la base de données MongoDB
mongoose.connect(
process.env.MONGO_URI // URI de la base de données MongoDB depuis les variables d'environnement
 )
   .then(() => console.log('Connexion à MongoDB réussie !'))
   .catch(() => console.log('Connexion à MongoDB échouée !'));



app.use(express.json()); // Middleware pour parser les requêtes JSON

// Middleware pour configurer les en-têtes CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permet toutes les origines
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // Autorise certains en-têtes
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Autorise certaines méthodes HTTP
  next(); // Passe au middleware suivant
});

app.use('/api/book', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;