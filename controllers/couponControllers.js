const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../middlewares/errors/apiError");
const ApiFeatures = require("../middlewares/ApiFeatures");

/*
  @ POST
  @ http://localhost:5000/api/coupons/
  @ PRIVATE
*/
exports.createCoupon = asyncHandler(async (req, res) => {
  const newCoupon = await Coupon.create(req.body);
  res.status(200).json({ data: newCoupon });
});

/*
  @ GET
  @ http://localhost:5000/api/coupons/
  @ http://localhost:5000/api/coupons/?rating[gte]=5&name=wael
  @ http://localhost:5000/api/coupons/?sort=-rating
  @ http://localhost:5000/api/coupons/?limit=5
  @ http://localhost:5000/api/coupons/?keyword=elect
  @ http://localhost:5000/api/coupons/?fields=name,rating
  @ PUBLIC
*/
exports.getCoupon = asyncHandler(async (req, res, next) => {
  const documentCounts = await Coupon.countDocuments();
  const apiFeatures = new ApiFeatures(Coupon.find(), req.query)
    .paginate(documentCounts)
    .filter()
    .search()
    .limitFields()
    .sort();
  //excute
  const { mongooseQuery, paginationResult } = apiFeatures;
  const coupons = await mongooseQuery;
  res
    .status(200)
    .json({ results: coupons.length, paginationResult, data: coupons });
});

/*
  @ GET
  @ http://localhost:5000/api/coupons/:id
  @ PUBLIC
*/
exports.getCouponById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    return next(ApiError(`No coupon for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: coupon });
  }
});

/*
  @ PUT
  @ http://localhost:5000/api/coupons/:id
  @ PRIVATE
*/
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const coupon = await Coupon.findOneAndUpdate(
    { _id: id },
    {
      $set: req.body,
    },
    { new: true }
  );
  if (!coupon) {
    return next(ApiError(`No coupon for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: coupon });
  }
});

/*
  @ DELETE
  @ http://localhost:5000/api/coupons/:id
  @ PRIVATE
*/
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    return next(ApiError(`No coupon for this id ${id}`, 404));
  } else {
    res.status(200).json({ msg: "coupon has been deleted.." });
  }
});
