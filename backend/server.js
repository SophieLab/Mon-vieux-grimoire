// Étape 1 : Importation des modules nécessaires
const http = require('http'); // Module pour créer un serveur HTTP
const app = require('./app'); // Application Express importée depuis le fichier app.js

// Étape 2 : Fonction pour normaliser le port
const normalizePort = val => {
  const port = parseInt(val, 10); // Convertit la valeur fournie en entier (base 10)

  if (isNaN(port)) {
    return val; // Si ce n'est pas un nombre, renvoie la valeur originale
  }
  if (port >= 0) {
    return port; // Si le port est un nombre positif, le renvoie
  }
  return false; // Renvoie false pour les valeurs invalides
};

// Étape 3 : Normalisation du port
const port = normalizePort(process.env.PORT || '4000'); // Définit le port à utiliser (ou le port par défaut 4000)
app.set('port', port); // Configure l'application Express pour utiliser le port spécifié

// Étape 4 : Gestionnaire d'erreurs pour le serveur
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error; // Relance l'erreur si elle ne concerne pas l'écoute
  }
  const address = server.address(); // Récupère l'adresse du serveur
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port; // Définit l'adresse de liaison pour le message d'erreur
  switch (error.code) {
    case 'EACCES': // Erreur de permissions
      console.error(bind + ' requires elevated privileges.'); // Affiche un message d'erreur
      process.exit(1); // Quitte le processus avec un code d'erreur
      break;
    case 'EADDRINUSE': // Port déjà utilisé
      console.error(bind + ' is already in use.'); // Affiche un message d'erreur
      process.exit(1); // Quitte le processus avec un code d'erreur
      break;
    default:
      throw error; // Relance l'erreur pour les autres cas
  }
};

// Étape 5 : Création d'un serveur HTTP en utilisant l'application Express
const server = http.createServer(app); // Crée un serveur HTTP qui utilise l'application Express

// Étape 6 : Ajout de gestionnaires d'événements pour le serveur
server.on('error', errorHandler); // Gère les erreurs du serveur en utilisant le gestionnaire d'erreurs défini
server.on('listening', () => {
  const address = server.address(); // Récupère l'adresse du serveur
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port; // Définit l'adresse de liaison pour le message de succès
  console.log('Listening on ' + bind); // Affiche un message lorsque le serveur commence à écouter
});

// Étape 7 : Démarrage du serveur
server.listen(port); // Le serveur écoute sur le port spécifié
