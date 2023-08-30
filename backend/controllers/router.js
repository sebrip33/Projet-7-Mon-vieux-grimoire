const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    book.save()
    .then(() => { res.status(201).json({ message: 'Livre enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
  };

  exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body};

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
      .then((book) => {
        if (book.userId != req.auth.userId) {
          res.status(401).json({ message : 'Non-autorisé' });
        } else {
          Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
          .then(() => res.status(200).json({message : 'Livre modifié!'}))
          .catch(error => res.status(401).json({ error }));
        }
      })
      .catch((error) => {
        res.status(400).json({ error })
      })
  };

  exports.deleteBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
      .then(book => {
        if (book.userId != req.auth.userId) {
          res.status(401).json({ message: 'Non-autorisé' });
        } else {
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Book.deleteOne({_id: req.params.id})
              .then(() => { res.status(200).json({ message: 'Livre supprimé !'})})
              .catch(error => { res.status(401).json({ error })});
          });
        }
      })
      .catch( error => {
        res.status(500).json({ error });
      })
  };

  exports.getBestRating = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 })    // Trier les livres par note moyenne de façon décroissante
        .limit(3)   // Récupère les 3 premiers livres du tri
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({error}));
};

  exports.getOneBook = (req, res, next) => {
    const bookId = req.params.id;
  
    Book.findOne({ _id: bookId }) // Recherche par ID
    .then(book => {
        if (!book) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }
        res.status(200).json(book);
    })
    .catch(error => {
        console.error(error); // Afficher l'erreur dans la console pour le débogage
        res.status(500).json({ message: "Erreur lors de la recherche du livre" });
    });
  };

  exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => {
            res.status(200).json(books);
        })
        .catch(error => {
            res.status(400).json({ error });
        });
  };

  exports.ratingBook = async (req, res, next) => {
    try {
        const { userId } = req.auth;
        const { grade } = req.body;

        // Vérifier que la note est comprise entre 0 et 5
        if (grade < 0 || grade > 5) {
            return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
        }

        const updatedBook = await Book.findOneAndUpdate(
            { _id: req.params.id },
            { $push: { ratings: { userId, grade } } },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ message: 'Livre introuvable ou vous n\'avez pas encore noté ce livre' });
        }

        // Vérifier si l'utilisateur a déjà noté ce livre
        const existingRating = updatedBook.ratings.find(rating => rating.userId === userId);
        if (existingRating) {
            return res.status(200).json({ message: 'Vous avez déjà noté ce livre' });
        }

        // Calculer la nouvelle note moyenne
        const sum = updatedBook.ratings.reduce((acc, rating) => acc + rating.grade, 0);
        updatedBook.averageRating = sum / updatedBook.ratings.length;

        await updatedBook.save();

        res.status(200).json({ message: 'Votre note a été prise en compte.' });
    } catch (error) {
        res.status(400).json({ error });
    }
};