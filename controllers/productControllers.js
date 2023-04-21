const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../middlewares/errors/apiError");
const ApiFeatures = require("../middlewares/ApiFeatures");
const sharp = require("sharp");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");

/*
  @ POST
  @ http://localhost:5000/api/products/
  @ PRIVATE
*/
exports.createProduct = asyncHandler(async (req, res) => {
  const newProduct = await Product.create(req.body);
  res.status(200).json({ data: newProduct });
});

/*
  @ GET
  @ http://localhost:5000/api/products/
  @ http://localhost:5000/api/products/?rating[gte]=5&name=wael
  @ http://localhost:5000/api/products/?sort=-rating
  @ http://localhost:5000/api/products/?limit=5
  @ http://localhost:5000/api/products/?keyword=elect
  @ http://localhost:5000/api/products/?fields=name,rating
  @ PUBLIC
*/
exports.getProduct = asyncHandler(async (req, res, next) => {
  //const fields = req.query.fields.split(',').join(' ');
  var objectCount = {};
  if (req.query) {
    const queryStringObj = { ...req.query };
    const excludesFields = ["page", "sort", "limit", "fields"];
    excludesFields.forEach((field) => delete queryStringObj[field]);
    // for count gte lte below
    let queryStr = JSON.stringify(queryStringObj, null);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // for count gte lte above
    objectCount = JSON.parse(queryStr);
  }

  const documentCounts = await Product.countDocuments(objectCount);
  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .paginate(documentCounts)
    .limitFields()
    .sort()
    .filter();
  //excute
  const { mongooseQuery, paginationResult } = apiFeatures;
  const products = await mongooseQuery;
  res.status(200).json({
    results: documentCounts,
    resultsLimit: products.length,
    paginationResult,
    data: products,
  });
});

/*
  @ GET
  @ http://localhost:5000/api/products/:id
  @ PUBLIC
*/
exports.getProductById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) {
    return next(ApiError(`No product for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: product });
  }
});

/*
  @ PUT
  @ http://localhost:5000/api/products/:id
  @ PRIVATE
*/
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findOneAndUpdate(
    { _id: id },

    { $set: req.body },

    { new: true }
  );
  if (!product) {
    return next(ApiError(`No product for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: product });
  }
});

/*
  @ DELETE
  @ http://localhost:5000/api/categories/:id
  @ PRIVATE
*/
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return next(ApiError(`No product for this id ${id}`, 404));
  } else {
    const query = { product: id };
    const result = await Review.deleteOne(query);
    result && res.status(200).json({ msg: "product has been deleted.." });
    product.remove();
  }
});

//MIDDLEWARE UPLOADED mix IMAGE
exports.uploadProductImages = uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);
//MIDDLEWARE RESIZE SINGLE IMAGE
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // 1 - IMAGE PROCESSING FOR IMAGE COVER
  var response = {};
  if (req.files && req.files.imageCover) {
    var image = "";
    const imageCoverFileName =
      "product-" +
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      "-cover.jpeg";
    await sharp(req.files.imageCover[0].buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile("assets/uploads/products/" + imageCoverFileName);

    image = imageCoverFileName;
  }
  // 2 - IMAGE PROCESSING FOR IMAGES
  if (req.files && req.files.images) {
    var arr = [];
    var images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName =
          "products-" +
          Date.now() +
          "-" +
          Math.round(Math.random() * 1e9) +
          index +
          ".jpeg";
        await sharp(img.buffer)
          .resize(600, 600)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile("assets/uploads/products/" + imageName);
        arr.push(imageName);
      })
    );
    images = arr;
  }
  response = { image, images };
  res.status(200).json({ data: response });
});
