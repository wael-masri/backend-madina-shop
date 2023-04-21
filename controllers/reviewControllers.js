const Review = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../middlewares/errors/apiError");
const ApiFeatures = require("../middlewares/ApiFeatures");

/*
  @ POST
  @ http://localhost:5000/api/reviews/
  @ PRIVATE
*/
exports.createReview = asyncHandler(async (req, res) => {
    const newReview = await Review.create(req.body);
    res.status(200).json({ data: newReview });
  });

/*
  @ GET
  @ http://localhost:5000/api/reviews/
  @ http://localhost:5000/api/reviews/?rating[gte]=5&name=wael
  @ http://localhost:5000/api/reviews/?sort=-rating
  @ http://localhost:5000/api/reviews/?limit=5
  @ http://localhost:5000/api/reviews/?keyword=elect
  @ http://localhost:5000/api/reviews/?fields=name,rating
  @ PUBLIC
*/  
exports.getReview = asyncHandler(async (req, res, next) => {
    let filterObject = {};
    if (req.params.productId) filterObject = { product: req.params.productId };
    const documentCounts = await Review.countDocuments();
    const apiFeatures = new ApiFeatures(Review.find(filterObject), req.query)
      .paginate(documentCounts)
      .filter()
      .search()
      .limitFields()
      .sort();
    //excute
    const { mongooseQuery, paginationResult } = apiFeatures;
    const reviews = await mongooseQuery;
    res
      .status(200)
      .json({ results: reviews.length, paginationResult, data: reviews });
  });

/*
  @ GET
  @ http://localhost:5000/api/reviews/:id
  @ PUBLIC
*/  
exports.getReviewById = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const review = await Review.findById(id);
    if (!review) {
      return next(ApiError(`No review for this id ${id}`, 404));
    } else {
      res.status(200).json({ data: review });
    }
  });

  /*
  @ PUT
  @ http://localhost:5000/api/reviews/:id
  @ PRIVATE
*/
exports.updateReview = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const review = await Review.findOneAndUpdate(
      { _id: id },
      {
        $set: req.body,
      },
      { new: true }
    );
    if (!review) {
      return next(ApiError(`No review for this id ${id}`, 404));
    } else {
      // kerml midl save bl model 
      await review.save()
      res.status(200).json({ data: review });
    }
  });

/*
  @ DELETE
  @ http://localhost:5000/api/reviews/:id
  @ PRIVATE
*/  
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
  
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return next(ApiError(`No review for this id ${id}`, 404));
    } else {
      review.remove();
      res.status(200).json({ msg: "review has been deleted.." });
    }
  });