const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Fonction pour l'inscription d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    // Hachage du mot de passe avant de le sauvegarder
    bcrypt.hash(req.body.password, 10) // Hache le mot de passe avec un coût de 10
        .then(hash => {
            const user = new User({
                email: req.body.email, // Récupère l'email de la requête
                password: hash // Stocke le mot de passe haché
            });

            // Enregistre l'utilisateur dans la base de données
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' })) // Envoie une confirmation de création
                .catch(error => res.status(400).json({ error })); // Gère les erreurs de sauvegarde
        })
        .catch(error => res.status(500).json({ error })); // Gère les erreurs de hachage
};

// Fonction pour la connexion d'un utilisateur existant
exports.login = (req, res, next) => {
    // Recherche l'utilisateur par email
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' }); // Gère le cas où l'utilisateur n'existe pas
            }

            // Compare le mot de passe fourni avec le mot de passe haché dans la base de données
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' }); // Gère le mot de passe incorrect
                    }

                    // Envoie une réponse avec l'ID de l'utilisateur et un token JWT
                    res.status(200).json({
                        userId: user._id, // Récupère l'ID de l'utilisateur
                        token: jwt.sign(
                            { userId: user._id }, // Crée le payload du token
                            'RANDOM_TOKEN_SECRET', // Clé secrète pour signer le token
                            { expiresIn: '24h' } // Définit la durée d'expiration du token
                        )
                    });
                })
                .catch(error => res.status(500).json({ error })); // Gère les erreurs de comparaison
        })
        .catch(error => res.status(500).json({ error })); // Gère les erreurs de recherche
};
