const multer = require('multer');
const sharp = require('sharp');

// Configuration de multer pour stocker les fichiers en mémoire
const storage = multer.memoryStorage(); // Utilisation de la mémoire pour le stockage temporaire des fichiers
const upload = multer({ storage }).single('image'); // Configuration de multer avec le stockage en mémoire

// Middleware pour gérer le téléchargement et le traitement d'images
module.exports = (req, res, next) => {
  //  Utilisation de multer pour gérer le téléchargement de fichiers
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de téléchargement du fichier' });
    }

    if (!req.file) {
      return next();
    }

    // Récupération du buffer et du nom original du fichier téléchargé
    const { buffer, originalname } = req.file;

    // Création d'un nom de fichier unique en utilisant un timestamp et le nom original
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, ''); // Génération d'un timestamp
    const ref = `${timestamp}-${originalname}.webp`; // Définit le format de sortie en .webp
    const path = "./images/" + ref; // Chemin où l'image sera enregistrée

    //  Utilisation de sharp pour traiter l'image et la sauvegarder
    sharp(buffer)
      .webp({ quality: 20 }) // Conversion de l'image en format webp avec une qualité de 20
      .toFile(path) // Sauvegarde le fichier au chemin spécifié
      .then(() => {
        req.file.filename = ref; // Stockage du nom de fichier dans req.file
        next(); // Passe au middleware suivant
      })
      .catch(() => {
        res.status(500).json({ error: 'Erreur dans le processus de traitement de l\'image' }); // Renvoie une réponse 500 en cas d'erreur
      });
  });
};
