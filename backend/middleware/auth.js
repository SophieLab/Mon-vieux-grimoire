const jwt = require('jsonwebtoken'); // Importation du module jsonwebtoken pour vérifier les tokens JWT

// Middleware pour authentifier les requêtes avec un token JWT
module.exports = (req, res, next) => {
  try {
    // Récupère le token depuis l'en-tête Authorization de la requête
    const token = req.headers.authorization.split(' ')[1];

    // Vérifie le token et décode son contenu
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

    // Récupère l'ID utilisateur du token décodé
    const userId = decodedToken.userId;

    // Ajoute l'ID utilisateur à l'objet de requête pour un accès ultérieur
    req.auth = {
      userId: userId
    };

    // Passe le contrôle au middleware suivant
    next();
  } catch (error) {
    // Si le token est invalide ou expiré, renvoie une réponse 401 Unauthorized
    res.status(401).json({ error });
  }
};
