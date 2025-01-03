const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const spotgrounds = require('../controllers/bulakangrounds')
const { spotgroundSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor, validateSpotground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// const ExpressError = require('../utils/ExpressError');
const Spotground = require('../models/spotground');



router.route('/')
//INDEX PAGE
    .get(catchAsync(spotgrounds.index))
//CREATE NEW SPOTGROUND
    .post(isLoggedIn, upload.array('image'), validateSpotground, catchAsync(spotgrounds.createPage));



//NEW
router.get('/new', isLoggedIn, spotgrounds.newForm);

router.route('/:id')
//SHOWPAGE
    .get(catchAsync(spotgrounds.showPage))
//UPDATE SHOWPAGE
    .put(isLoggedIn, isAuthor, upload.array('image'), validateSpotground, catchAsync(spotgrounds.updatePage))
//DELETE 
    .delete(isLoggedIn, isAuthor, catchAsync(spotgrounds.deletePage));

//EDIT SHOWPAGE
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(spotgrounds.editPage));


module.exports = router;