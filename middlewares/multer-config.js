const multer = require('multer');

const MIME_TYPE = {
    'image/jpg' : 'jpg',
    'image/jpeg' : 'jpeg',
    'image/png' : 'png'
}

const storage = multer.memoryStorage();


module.exports = multer({storage}).single('image')