// Étape 1 : Importation du module jsonwebtoken pour vérifier les tokens JWT
const jwt = require('jsonwebtoken');

// Étape 2 : Middleware pour authentifier les requêtes avec un token JWT
module.exports = (req, res, next) => {
  try {
    // Étape 3 : Récupération du token depuis l'en-tête Authorization de la requête
    const token = req.headers.authorization.split(' ')[1];

    // Étape 4 : Vérification du token et décodage de son contenu
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

    // Étape 5 : Récupération de l'ID utilisateur du token décodé
    const userId = decodedToken.userId;

    // Étape 6 : Ajout de l'ID utilisateur à l'objet de requête pour un accès ultérieur
    req.auth = {
      userId: userId // Stockage de l'ID utilisateur dans req.auth
    };

    // Étape 7 : Passage du contrôle au middleware suivant
    next();
  } catch (error) {
    // Étape 8 : Gestion des erreurs
    // Si le token est invalide ou expiré, renvoie une réponse 401 Unauthorized
    res.status(401).json({ error }); // Renvoie l'erreur dans la réponse
  }
};
