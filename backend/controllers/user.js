const User = require('../models/User'); // Importation du modèle User pour interagir avec la base de données
const jwt = require('jsonwebtoken'); // Importation de jsonwebtoken pour gérer les tokens JWT
const bcrypt = require('bcrypt'); // Importation de bcrypt pour le hachage des mots de passe

// Fonction pour l'inscription d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    // Hachage du mot de passe avant de le sauvegarder
    bcrypt.hash(req.body.password, 10) // Étape 1 : Hache le mot de passe avec un coût de 10
        .then(hash => {
            const user = new User({
                email: req.body.email, // Étape 2 : Récupère l'email de la requête
                password: hash // Étape 3 : Stocke le mot de passe haché
            });

            // Enregistre l'utilisateur dans la base de données
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' })) // Étape 4 : Envoie une confirmation de création
                .catch(error => res.status(400).json({ error })); // Étape 5 : Gère les erreurs de sauvegarde
        })
        .catch(error => res.status(500).json({ error })); // Étape 6 : Gère les erreurs de hachage
};

// Fonction pour la connexion d'un utilisateur existant
exports.login = (req, res, next) => {
    // Recherche l'utilisateur par email
    User.findOne({ email: req.body.email }) // Étape 1 : Recherche de l'utilisateur par email
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' }); // Étape 2 : Gère le cas où l'utilisateur n'existe pas
            }

            // Compare le mot de passe fourni avec le mot de passe haché dans la base de données
            bcrypt.compare(req.body.password, user.password) // Étape 3 : Comparaison des mots de passe
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' }); // Étape 4 : Gère le mot de passe incorrect
                    }

                    // Envoie une réponse avec l'ID de l'utilisateur et un token JWT
                    res.status(200).json({
                        userId: user._id, // Étape 5 : Récupère l'ID de l'utilisateur
                        token: jwt.sign( // Étape 6 : Création du token JWT
                            { userId: user._id }, // Payload du token
                            'RANDOM_TOKEN_SECRET', // Clé secrète pour signer le token
                            { expiresIn: '24h' } // Durée d'expiration du token
                        )
                    });
                })
                .catch(error => res.status(500).json({ error })); // Étape 7 : Gère les erreurs de comparaison
        })
        .catch(error => res.status(500).json({ error })); // Étape 8 : Gère les erreurs de recherche
};