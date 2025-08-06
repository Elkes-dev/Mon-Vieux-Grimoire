const express = require('express')
const ctrlBooks = require('../controllers/books');
const auth = require('../middlewares/auth') 
const multer = require('../middlewares/multer-config')
const optimizeImages = require('../middlewares/optimizeImages')

const router = express.Router();


router.get('/bestrating', ctrlBooks.bestRating)
router.post('/:id/rating',auth, ctrlBooks.ratingBooks)

router.get('/:id', ctrlBooks.singleBook)

router.post('/',auth,multer,optimizeImages, ctrlBooks.createBook)

router.put('/:id',auth,multer,optimizeImages, ctrlBooks.modifyBooks)

router.delete('/:id', auth, ctrlBooks.deleteBook)

router.get('/', ctrlBooks.getAllBooks)


module.exports = router