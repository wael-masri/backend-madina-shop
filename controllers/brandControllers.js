const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../middlewares/errors/apiError");
const ApiFeatures = require("../middlewares/ApiFeatures");
const sharp = require("sharp");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
/*
  @ POST
  @ http://localhost:5000/api/brands/
  @ PRIVATE
*/
exports.createBrand = asyncHandler(async (req, res) => {
  const newBrand = await Brand.create(req.body);
  res.status(200).json({ data: newBrand });
});

/*
  @ GET
  @ http://localhost:5000/api/brands/
  @ http://localhost:5000/api/brands/?rating[gte]=5&name=wael
  @ http://localhost:5000/api/brands/?sort=-rating
  @ http://localhost:5000/api/brands/?limit=5
  @ http://localhost:5000/api/brands/?keyword=elect
  @ http://localhost:5000/api/brands/?fields=name,rating
  @ PUBLIC
*/
exports.getBrand = asyncHandler(async (req, res, next) => {
  const documentCounts = await Brand.countDocuments();
  const apiFeatures = new ApiFeatures(Brand.find(), req.query)
    .paginate(documentCounts)
    .filter()
    .search()
    .limitFields()
    .sort();
  //excute
  const { mongooseQuery, paginationResult } = apiFeatures;
  const brands = await mongooseQuery;
  res
    .status(200)
    .json({ results: brands.length, paginationResult, data: brands });
});

/*
  @ GET
  @ http://localhost:5000/api/brands/:id
  @ PUBLIC
*/
exports.getBrandById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const brand = await Brand.findById(id);
  if (!brand) {
    return next(ApiError(`No brand for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: brand });
  }
});

/*
  @ PUT
  @ http://localhost:5000/api/brands/:id
  @ PRIVATE
*/
exports.updateBrand = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (req.body.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/`;
    const imageWithoutUrl = req.body.image.replace(imageUrl, "");
    req.body.image = imageWithoutUrl;
  }

  const brand = await Brand.findOneAndUpdate(
    { _id: id },
    {
      $set: req.body,
    },
    { new: true }
  );
  if (!brand) {
    return next(ApiError(`No brand for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: brand });
  }
});

/*
  @ DELETE
  @ http://localhost:5000/api/brands/:id
  @ PRIVATE
*/
exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) {
    return next(ApiError(`No brand for this id ${id}`, 404));
  } else {
    res.status(200).json({ msg: "brand has been deleted.." });
  }
});

//MIDDLEWARE UPLOADED SINGLE IMAGE
exports.uploadBrandImage = uploadSingleImage("image");

//MIDDLEWARE RESIZE SINGLE IMAGE
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    var image = "";
    const fileName =
      "brand-" + Date.now() + "-" + Math.round(Math.random() * 10) + ".jpeg";
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile("assets/uploads/brands/" + fileName);
    //save image into our db
    image = fileName;
  }
  res.status(200).json({ data: image });
});
