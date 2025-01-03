const Spotground = require('../models/spotground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const spotground = await Spotground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    spotground.reviews.push(review);
    await review.save();
    await spotground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/spotgrounds/${spotground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Spotground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/spotgrounds/${id}`);
}