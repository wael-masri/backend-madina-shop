const mongoose = require("mongoose");
const Category = require("./categoryModel");
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Too short product title"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [20, "Too short product description"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      trim: true,
      max: [100000, "Too long product price"],
    },
    priceAfterDiscount: {
      type: Number,
      default : 0
    },
    color: [String],
    size: [String],
    model: [String],
    tag: [String],
    expire: {
      type: Date,
      default : ""
    },
    imageCover: {
      type: String,
      required: [true, "Product Image cover is required"],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product must be belong to category"],
    },
    subCategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
    },
    status: {
      type: Boolean,
      required: true,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingSum: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// const setImageUrl = (doc) => {
//   if (doc.imageCover) {
//     const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
//     doc.imageCover = imageUrl;
//   }
//   if (doc.images) {
//     const imageList = [];
//     doc.images.forEach((image) => {
//       const imageUrl = `${process.env.BASE_URL}/products/${image}`;
//       imageList.push(imageUrl);
//     });
//     doc.images = imageList;
//   }
// };
productSchema.statics.calcNumberOfProducts = async function (categoryId) {
  const result = await this.aggregate([
    {
      $match: { category: categoryId },
    },
    {
      $group: {
        _id: "category",
        numberOfProducts: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Category.findByIdAndUpdate(categoryId, {
      numberOfProduct: result[0].numberOfProducts,
    });
  } else {
    await Category.findByIdAndUpdate(categoryId, {
      numberOfProduct: 0,
    });
  }
};

//BI RUN MA3 UPDATE, GET AND GET ALL
productSchema.post("init", async function (doc) {
  //return image url + image name
  setImageUrl(doc);
});
//HON KERML YRDLNA URL BASS Y3MOL CREATE LA POST
productSchema.post("save", async function (doc) {
  //return image url + image name
  setImageUrl(doc);
  await this.constructor.calcNumberOfProducts(this.category);
});
productSchema.post("remove", async function () {
  await this.constructor.calcNumberOfProducts(this.category._id);
});
// kel ma ne3mol finde y3mlna populate w yjblna name of user
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category brand subCategories",
    select: "name image status",
  });

  next();
});

module.exports = mongoose.model("Product", productSchema);
