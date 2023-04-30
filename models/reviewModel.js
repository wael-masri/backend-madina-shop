const mongoose = require("mongoose");
const Product = require("./productModel");
const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Title is too long !"],
      minlength: [3, "Title is too short !"],
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Min rating value is 1"],
      max: [5, "Min rating value is 5"],
      required: [true, "Rating required!"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to user"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to product"],
    },
    reply: {
      type: String,
      trim: true,
      maxlength: [400, "Title is too long !"],
    },
  },
  { timestamps: true }
);

// kel ma ne3mol finde y3mlna populate w yjblna name of user
reviewSchema.pre(/^find/, function (next) {
  this.populate([
    { path: "user", select: "name profileImage active imageGoogle" },
    {
      path: "product",
      select: "title imageCover -category -subCategories -brand",
    },
  ]);
  next();
});

reviewSchema.statics.calcAverageRatings = async function (productId) {
 
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "product",
        avg: { $avg: "$rating" },
        ratingQuantity: { $sum: 1 },
      },
    },
  ]);
  
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: result[0].avg,
      ratingSum:result[0].ratingQuantity
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      ratingSum:0
    });
  }
};
reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatings(this.product);
});
reviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRatings(this.product._id);
});
module.exports = mongoose.model("Review", reviewSchema);
