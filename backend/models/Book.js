const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true },   // Identifiant MongoDB unique de l'utilisateur qui a crée le livre
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },     // Illustration/couverture du livre
    year: {type: Number, required: true },   
    genre: { type: String, required: true },    
    ratings: [
        {
        userId: { type: String, required: true },   // Identifiant de l'utilisateur qui a crée le livre
        grade: {type: Number, required: true}       // Note donnée à un livre
        }
    ],
    averageRating: { type: Number, required: true }     // Note moyenne du livre
});

module.exports = mongoose.model('Book', bookSchema);