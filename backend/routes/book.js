const express = require('express'); // Importation du module express pour créer des routes
const router = express.Router(); // Création d'un routeur pour définir les endpoints

const auth = require('../middleware/auth'); // Importation du middleware d'authentification
const multer = require('../middleware/multer-config'); // Importation du middleware pour la gestion des fichiers

const bookCtrl = require('../controllers/book'); // Importation du contrôleur de livres

// Définition des routes pour les livres
router.get('/', bookCtrl.getAllBooks); // Route pour récupérer tous les livres
router.get('/bestrating', bookCtrl.bestBooks); // Route pour récupérer les meilleurs livres
router.get('/:id', bookCtrl.getOneBook); // Route pour récupérer un livre par son ID
router.post('', auth, multer, bookCtrl.createBook); // Route pour créer un nouveau livre (requiert authentification et gestion des fichiers)
router.put('/:id', auth, multer, bookCtrl.modifyBook); // Route pour modifier un livre existant (requiert authentification et gestion des fichiers)
router.delete('/:id', auth, bookCtrl.deleteBook); // Route pour supprimer un livre (requiert authentification)
router.post('/:id/rating', auth, bookCtrl.rateBook); // Route pour noter un livre (requiert authentification)

module.exports = router; // Exporte le routeur pour l'utiliser dans d'autres fichiers
