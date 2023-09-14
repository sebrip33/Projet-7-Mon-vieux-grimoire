const express = require('express');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const path = require('path');

require('dotenv').config();

const routerRoutes = require('./routes/router');
const userRoutes = require('./routes/user');


// Partie connexion à la base de donnée MongoD
mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(error => console.error('Connexion à MongoDB échouée ! Erreur: ', error));

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());
app.use(mongoSanitize());
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use('/api/books', routerRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;