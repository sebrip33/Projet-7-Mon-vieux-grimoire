const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


// Ajout d'un utilisateur à la base de données
exports.signup = (req, res, next) => {
    // Vérifier si l'email et le mot de passe sont fournis dans le corps de la requête
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'Veuillez remplir tous les champs' })
  }
  
    // Valider l'adresse email
    if (!/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(req.body.email)) {
        return res.status(400).json({ message: 'Adresse email invalide' });
        }

    // Valider le mot de passe
    if (req.body.password.length < 7) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 7 caractères' });
    }

  // Hacher le mot de passe
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    // Nouvel utilisateur avec l'email et le MDP haché
    const user = new User({
      email: req.body.email,
      password: hash
    });

    // Enregistrer l'utilisateur dans la base de données
    user.save()
    .then(() => res.status(201).json({ message: 'Utilisateur crée' }))
    .catch(error => res.status(400).json({ error }));
  })
  .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    // Vérifiez si l'email et le mot de passe sont fournis dans le corps de la requête
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
}

// Recherchez l'utilisateur dans la base de données en utilisant l'email fourni
User.findOne({ email: req.body.email })
    .then(user => {
        if (user === null) {
            return res.status(401).json({ message: 'Identifiant/mot de passe incorrect' });
        } else {
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Identifiant/mot de passe incorrect' });
                    } else {
                        res.status(200).json({
                            userId: user._id,
                            token: jwt.sign(
                                { userId: user._id },
                                'RANDOM_TOKEN_SECRET',
                                { expiresIn: '24h' }
                            )
                        });
                    }
                })
                .catch(error => res.status(500).json({ error }));
        }
    })
    .catch(error => res.status(500).json({ error }));

};