const Spotground = require('../models/spotground');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

const { isLoggedIn, isAuthor, validateSpotground } = require('../middleware');
const { cloudinary } = require("../cloudinary");
const { spotgroundSchema } = require('../schemas.js');

module.exports.index = async (req, res) => {
    const spotgrounds = await Spotground.find({});
    res.render('spotgrounds/index', { spotgrounds });
}

module.exports.newForm = (req, res) => {
    res.render('spotgrounds/new');
}

module.exports.createPage = async (req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.spotground.location, { limit: 1 });
    const spotground = new Spotground(req.body.spotground);
    spotground.geometry = geoData.features[0].geometry;
    spotground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    spotground.author = req.user._id;
    await spotground.save();
    req.flash('success', 'Successfully made a new Spot!');
    res.redirect(`/spotgrounds/${spotground._id}`)
}

module.exports.showPage = async (req, res,) => {
    const spotground = await Spotground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        },
    }).populate('author');
    console.log(spotground);
    if (!spotground) {
        req.flash('error', 'Cannot find that Spot!');
        return res.redirect('/spotgrounds');
    }
    res.render('spotgrounds/show', { spotground });
}

module.exports.editPage = async (req, res) => {
    const { id } = req.params;
    const spotground = await Spotground.findById(id)
    if (!spotground) {
        req.flash('error', 'Cannot find that Spot!');
        return res.redirect('/spotgrounds');
    }
    res.render('spotgrounds/edit', { spotground });
}

module.exports.updatePage = async (req, res) => {
    const { id } = req.params;
    const spotground = await Spotground.findByIdAndUpdate(id, { ...req.body.spotground });
    const geoData = await maptilerClient.geocoding.forward(req.body.spotground.location, { limit: 1 });
    spotground.geometry = geoData.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    spotground.images.push(...imgs);
    await spotground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await spotground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully Updated!');
    res.redirect(`/spotgrounds/${spotground._id}`);
}

module.exports.deletePage = async (req, res) => {
    const { id } = req.params;
    await Spotground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted')
    res.redirect('/spotgrounds');
}