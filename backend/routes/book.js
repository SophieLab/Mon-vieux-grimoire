const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const multer = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');

// Définition des routes pour les livres
router.get('/', bookCtrl.getAllBooks); // Route pour récupérer tous les livres
router.get('/bestrating', bookCtrl.bestBooks); // Route pour récupérer les meilleurs livres
router.get('/:id', bookCtrl.getOneBook); // Route pour récupérer un livre par son ID
router.post('/', auth, multer, bookCtrl.createBook); // Route pour créer un nouveau livre (requiert authentification et gestion des fichiers)
router.put('/:id', auth, multer, bookCtrl.modifyBook); // Route pour modifier un livre existant (requiert authentification et gestion des fichiers)
router.delete('/:id', auth, bookCtrl.deleteBook); // Route pour supprimer un livre (requiert authentification)
router.post('/:id/rating', auth, bookCtrl.rateBook); // Route pour noter un livre (requiert authentification)

module.exports = router;
