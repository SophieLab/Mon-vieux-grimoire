// Étape 1 : Importation des modules nécessaires
const multer = require('multer'); // Importation de multer pour gérer le téléchargement de fichiers
const sharp = require('sharp'); // Importation de sharp pour le traitement d'images

// Étape 2 : Configuration de multer pour stocker les fichiers en mémoire
const storage = multer.memoryStorage(); // Utilisation de la mémoire pour le stockage temporaire des fichiers

// Étape 3 : Préparation de multer pour accepter un seul fichier avec le champ 'image'
const upload = multer({ storage }).single('image'); // Configuration de multer avec le stockage en mémoire

// Étape 4 : Middleware pour gérer le téléchargement et le traitement d'images
module.exports = (req, res, next) => {
  // Étape 5 : Utilisation de multer pour gérer le téléchargement de fichiers
  upload(req, res, (err) => {
    if (err) {
      // Étape 6 : Gestion des erreurs de téléchargement
      // Si une erreur se produit lors du téléchargement, renvoie une réponse 500
      return res.status(500).json({ error: 'Erreur de téléchargement du fichier' });
    }

    // Étape 7 : Vérification de la présence d'un fichier
    if (!req.file) {
      // Si aucun fichier n'est présent, passe au middleware suivant
      return next();
    }

    // Étape 8 : Récupération du buffer et du nom original du fichier téléchargé
    const { buffer, originalname } = req.file;

    // Étape 9 : Création d'un nom de fichier unique en utilisant un timestamp et le nom original
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, ''); // Génération d'un timestamp
    const ref = `${timestamp}-${originalname}.webp`; // Définit le format de sortie en .webp
    const path = "./images/" + ref; // Chemin où l'image sera enregistrée

    // Étape 10 : Utilisation de sharp pour traiter l'image et la sauvegarder
    sharp(buffer)
      .webp({ quality: 20 }) // Conversion de l'image en format webp avec une qualité de 20
      .toFile(path) // Sauvegarde le fichier au chemin spécifié
      .then(() => {
        // Étape 11 : Ajout du nom de fichier à l'objet req.file pour un accès ultérieur
        req.file.filename = ref; // Stockage du nom de fichier dans req.file
        next(); // Passe au middleware suivant
      })
      .catch(() => {
        // Étape 12 : Gestion des erreurs de traitement d'image
        res.status(500).json({ error: 'Erreur dans le processus de traitement de l\'image' }); // Renvoie une réponse 500 en cas d'erreur
      });
  });
};
