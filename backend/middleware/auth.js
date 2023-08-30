const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Récupérer le token JWT du header Authorization
        const token = req.headers.authorization.split(' ')[1];

        // Vérifier si le token est valide
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const {userId} = decodedToken;
        req.auth = {
            userId: userId
        };
        // Vérifier si l'ID utilisateur dans le token correspond à l'ID utilisateur dans la requête (si présent)
        if (req.body.userId && req.body.userId != userId) {
            return res.status(403).json({
                error: '403: unauthorized request'
            });
        } else {
            next();
        }
    } catch(error) {
        res.status(401).json({ error });
    }
};