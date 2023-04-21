const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../middlewares/errors/apiError");
const ApiFeatures = require("../middlewares/ApiFeatures");
const sharp = require("sharp");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
/*
  @ POST
  @ http://localhost:5000/api/categories/
  @ PRIVATE
*/
exports.createCategory = asyncHandler(async (req, res) => {
  const newCategory = await Category.create(req.body);
  res.status(200).json({ data: newCategory });
});

/*
  @ GET
  @ http://localhost:5000/api/categories/
  @ http://localhost:5000/api/categories/?rating[gte]=5&name=wael
  @ http://localhost:5000/api/categories/?sort=-rating
  @ http://localhost:5000/api/categories/?limit=5
  @ http://localhost:5000/api/categories/?keyword=elect
  @ http://localhost:5000/api/categories/?fields=name,rating
  @ PUBLIC
*/
exports.getCategory = asyncHandler(async (req, res, next) => {
  const documentCounts = await Category.countDocuments();
  const apiFeatures = new ApiFeatures(Category.find(), req.query)
    .paginate(documentCounts)
    .filter()
    .search()
    .limitFields()
    .sort();
  //excute
  const { mongooseQuery, paginationResult } = apiFeatures;
  const categories = await mongooseQuery;
  res
    .status(200)
    .json({ results: categories.length, paginationResult, data: categories });
});

/*
  @ GET
  @ http://localhost:5000/api/categories/:id
  @ PUBLIC
*/
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const category = await Category.findById(id);
  if (!category) {
    return next(ApiError(`No category for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: category });
  }
});

/*
  @ PUT
  @ http://localhost:5000/api/categories/:id
  @ PRIVATE
*/
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (req.body.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/`;
    const imageWithoutUrl = req.body.image.replace(imageUrl, "");
    req.body.image = imageWithoutUrl;
  }

  const category = await Category.findOneAndUpdate(
    { _id: id },
    {
      $set: req.body,
    },
    { new: true }
  );
  if (!category) {
    return next(ApiError(`No category for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: category });
  }
});

/*
  @ DELETE
  @ http://localhost:5000/api/categories/:id
  @ PRIVATE
*/
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return next(ApiError(`No category for this id ${id}`, 404));
  } else {
    res.status(200).json({ msg: "Category has been deleted.." });
  }
});

//MIDDLEWARE UPLOADED SINGLE IMAGE
exports.uploadCategoryImage = uploadSingleImage("image");

//MIDDLEWARE RESIZE SINGLE IMAGE
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    var image = "";
    const fileName =
      "category-" + Date.now() + "-" + Math.round(Math.random() * 10) + ".jpeg";
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile("assets/uploads/categories/" + fileName);
    //save image into our db
    image = fileName;
  }
  res.status(200).json({ data: image });
});
