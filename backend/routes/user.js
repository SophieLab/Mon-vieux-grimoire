const express = require('express'); // Importation du module express pour créer des routes
const router = express.Router(); // Création d'un routeur pour définir les endpoints

const userCtrl = require('../controllers/user'); // Importation du contrôleur d'utilisateurs

// Définition des routes pour les utilisateurs
router.post('/signup', userCtrl.signup); // Route pour l'inscription d'un nouvel utilisateur
router.post('/login', userCtrl.login); // Route pour la connexion d'un utilisateur existant

module.exports = router; // Exporte le routeur pour l'utiliser dans d'autres fichiers
