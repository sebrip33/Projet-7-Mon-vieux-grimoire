const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

function resizeImage(imagePath) {
  sharp(imagePath)
    .resize(500, 500, {
      fit: sharp.fit.inside,
      withoutEnlargement: true
    })
    .toBuffer()
    .then(data => {
      fs.writeFileSync(imagePath, data);
    })
    .catch(err => {
      console.log(err);
    });
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    const filename = name + Date.now() + '.' + extension;
    callback(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (!MIME_TYPES[file.mimetype]) {
    cb(new Error('Invalid file type'), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limité à 5 Mo
  }
}).single('image');

module.exports = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    if (req.file) {
      const imagePath = `images/${req.file.filename}`;
      resizeImage(imagePath);
    }

    next();
  });
};
