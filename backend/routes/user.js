const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user'); 

// Définition des routes pour les utilisateurs
router.post('/signup', userCtrl.signup); // Route pour l'inscription d'un nouvel utilisateur
router.post('/login', userCtrl.login); // Route pour la connexion d'un utilisateur existant

module.exports = router; // Exporte le routeur pour l'utiliser dans d'autres fichiers
