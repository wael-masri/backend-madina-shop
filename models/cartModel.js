const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: String,
        price: Number,
        model:String,
        size:String
      },
    ],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'cartItems', 
    populate: {
       path: 'product',
       select:"title imageCover quantity -category -subCategories -brand",
    }})


  next();
});
cartSchema.pre("save", function (next) {
  this.populate({
    path: 'cartItems', 
    populate: {
       path: 'product',
       select:"title imageCover quantity -category -subCategories -brand",
    }})


  next();
});


module.exports = mongoose.model('Cart', cartSchema);