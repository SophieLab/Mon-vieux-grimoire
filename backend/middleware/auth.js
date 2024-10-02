// Importation du module jsonwebtoken pour vérifier les tokens JWT
const jwt = require('jsonwebtoken');

// Middleware pour authentifier les requêtes avec un token JWT
module.exports = (req, res, next) => {
  try {
    //  Récupération du token depuis l'en-tête Authorization de la requête
    const token = req.headers.authorization.split(' ')[1];

    // Vérification du token et décodage de son contenu
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

    // Récupération de l'ID utilisateur du token décodé
    const userId = decodedToken.userId;

    req.auth = {
      userId: userId // Stockage de l'ID utilisateur dans req.auth
    };

    //  Passage du contrôle au middleware suivant
    next();
  } catch (error) {
    // Si le token est invalide ou expiré, renvoie une réponse 401 Unauthorized
    res.status(401).json({ error }); // Renvoie l'erreur dans la réponse
  }
};
