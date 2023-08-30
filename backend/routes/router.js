const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');

const routerCtrl = require('../controllers/router');

router.get('/', routerCtrl.getAllBooks);
router.get('/bestrating', routerCtrl.getBestRating);
router.get('/:id', routerCtrl.getOneBook);
router.post('/', auth, multer, routerCtrl.createBook);
router.put('/:id', auth, multer, routerCtrl.modifyBook);
router.delete('/:id', auth, routerCtrl.deleteBook);
router.post('/:id/rating', auth, routerCtrl.ratingBook);

module.exports = router;