const multer = require('multer');
const sharp = require('sharp');
// Configuration de multer pour stocker les fichiers en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image'); // Prépare multer pour accepter un seul fichier avec le champ 'image'

// Middleware pour gérer le téléchargement et le traitement d'images
module.exports = (req, res, next) => {
  // Utilise multer pour gérer le téléchargement de fichiers
  upload(req, res, (err) => {
    if (err) {
      // Si une erreur se produit lors du téléchargement, renvoie une réponse 500
      return res.status(500).json({ error: 'Erreur de téléchargement du fichier' });
    }

    // Si aucun fichier n'est présent, passe au middleware suivant
    if (!req.file) {
      return next();
    }

    // Récupère le buffer et le nom original du fichier téléchargé
    const { buffer, originalname } = req.file;

    // Crée un nom de fichier unique en utilisant un timestamp et le nom original
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const ref = `${timestamp}-${originalname}.webp`; // Définit le format de sortie en .webp
    const path = "./images/" + ref; // Chemin où l'image sera enregistrée

    // Utilise sharp pour traiter l'image et la sauvegarder
    sharp(buffer)
      .webp({ quality: 20 }) // Convertit l'image en format webp avec une qualité de 20
      .toFile(path)
      .then(() => {
        req.file.filename = ref; // Ajoute le nom de fichier à l'objet req.file
        next();
      })
      .catch(() => res.status(500).json({ error: 'Erreur dans le processus de traitement de l\'image' })); // Gère les erreurs de traitement
  });
};