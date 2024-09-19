const express = require('express');

const router = express.Router();
// Route POST pour créer un objet
router.post('/', (req, res, next) => {
    delete req.body._id; // Supprimer l'ID du corps de la requête si existant
    const thing = new Thing({
        ...req.body // Utiliser les données de la requête pour créer un nouvel objet
    });
    thing.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
});



// Route GET pour récupérer un objet spécifique par son ID
router.get('/:id', (req, res, next) => {
    Thing.findOne({ _id: req.params.id }) // Rechercher un objet par son ID
        .then(thing => res.status(200).json(thing)) // Envoyer l'objet trouvé avec un statut 200
        .catch(error => res.status(404).json({ error })); // Gérer l'erreur si l'objet n'est pas trouvé
});

// Route PUT pour modifier un objet existant
router.put('/:id', (req, res, next) => {
    Thing.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id }) // Mettre à jour l'objet
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
});

// Route DELETE pour supprimer un objet
router.delete('/:id', (req, res, next) => {
    Thing.deleteOne({ _id: req.params.id }) // Supprimer l'objet par son ID
        .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
        .catch(error => res.status(400).json({ error }));
});



module.exports = router;