const http = require('http');
const app = require('./app');

// Fonction pour normaliser le port
const normalizePort = val => {
  const port = parseInt(val, 10); // Convertit la valeur en entier

  if (isNaN(port)) {
    return val; 
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Gestionnaire d'erreurs pour le serveur
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error; // Si l'erreur ne concerne pas l'écoute, relance l'erreur
  }
  const address = server.address(); // Récupère l'adresse du serveur
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port; // Définit l'adresse de liaison
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.'); // Gère les erreurs de permissions
      process.exit(1); // Quitte le processus
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.'); // Gère les erreurs de port déjà utilisé
      process.exit(1); // Quitte le processus
      break;
    default:
      throw error; // Pour toutes les autres erreurs, relance l'erreur
  }
};

// Crée un serveur HTTP en utilisant l'application Express
const server = http.createServer(app);

// Ajoute des gestionnaires d'événements pour le serveur
server.on('error', errorHandler); // Gère les erreurs du serveur
server.on('listening', () => {
  const address = server.address(); // Récupère l'adresse du serveur
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port; // Définit l'adresse de liaison
  console.log('Listening on ' + bind); // Affiche un message lorsque le serveur commence à écouter
});
server.listen(port);