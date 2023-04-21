const SubCategory = require("../models/subcategoryModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../middlewares/errors/apiError");
const ApiFeatures = require("../middlewares/ApiFeatures");


/*
  @ POST
  @ http://localhost:5000/api/subCategories/
  @ PRIVATE
*/
exports.createSubCategory = asyncHandler(async (req, res) => {
  const newSubCategory = await SubCategory.create(req.body);
  res.status(200).json({ data: newSubCategory });
});
/*
  @ GET
  @ http://localhost:5000/api/subCategories/
  @ http://localhost:5000/api/subCategories/?rating[gte]=5&name=wael
  @ http://localhost:5000/api/subCategories/?sort=-rating
  @ http://localhost:5000/api/subCategories/?limit=5
  @ http://localhost:5000/api/subCategories/?keyword=elect
  @ http://localhost:5000/api/subCategories/?fields=name,rating
  @ PUBLIC
*/
exports.getSubCategoryWithPopulate = asyncHandler(async (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };

  const documentCounts = await SubCategory.countDocuments();
  const apiFeatures = new ApiFeatures(SubCategory.find(filterObject), req.query)
    .paginate(documentCounts)
    .filter()
    .search()
    .limitFields()
    .sort()
    .populated({ path: "category", select: "name image status -_id" });
  //excute
  const { mongooseQuery, paginationResult } = apiFeatures;
  const subCategories = await mongooseQuery;
  res.status(200).json({
    results: subCategories.length,
    paginationResult,
    data: subCategories,
  });
});
/*
  @ GET
  @ http://localhost:5000/api/subCategories/
  @ http://localhost:5000/api/subCategories/?rating[gte]=5&name=wael
  @ http://localhost:5000/api/subCategories/?sort=-rating
  @ http://localhost:5000/api/subCategories/?limit=5
  @ http://localhost:5000/api/subCategories/?keyword=elect
  @ http://localhost:5000/api/subCategories/?fields=name,rating
  @ PUBLIC
*/
exports.getSubCategory = asyncHandler(async (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };

  const documentCounts = await SubCategory.countDocuments();
  const apiFeatures = new ApiFeatures(SubCategory.find(filterObject), req.query)
    .paginate(documentCounts)
    .filter()
    .search()
    .limitFields()
    .sort()
    
  //excute
  const { mongooseQuery, paginationResult } = apiFeatures;
  const subCategories = await mongooseQuery;
  res.status(200).json({
    results: subCategories.length,
    paginationResult,
    data: subCategories,
  });
});
/*
  @ GET
  @ http://localhost:5000/api/subCategories/:id
  @ PUBLIC
*/
exports.getSubCategoryById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const subCategory = await SubCategory.findById(id);
  if (!subCategory) {
    return next(ApiError(`No subCategory for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: subCategory });
  }
});


/*
  @ PUT
  @ http://localhost:5000/api/subCategories/:id
  @ PRIVATE
*/
exports.updateSubCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const subCategory = await SubCategory.findOneAndUpdate(
    { _id: id },
    {
      $set: req.body,
    },
    { new: true }
  );
  if (!subCategory) {
    return next(ApiError(`No subCategory for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: subCategory });
  }
});


/*
  @ DELETE
  @ http://localhost:5000/api/subCategories/:id
  @ PRIVATE
*/
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const subCategory = await SubCategory.findByIdAndDelete(id);
  if (!subCategory) {
    return next(ApiError(`No subCategory for this id ${id}`, 404));
  } else {
    res.status(200).json({ msg: "subCategory has been deleted.." });
  }
});
