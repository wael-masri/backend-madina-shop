const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must be belong to user"],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        color: String,
        size: String,
        model: String,
        price: Number,
      },
    ],
    shippingAddress: {
      firstName: String,
      lastName: String,
      city: String,
      address: String,
      appartment:String,
      phone: String,
      contact:String
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },

    taxPrice: {
      type: Number,
      default: 0,
    },
    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    shippingStatus: {
      type: String,
      enum: ["confirmed", "shipped","delivered"],
      default: "confirmed",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    refund: {
      type: Boolean,
      default: false,
    },
    refundAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'cartItems.product'
  });

  next();
});

module.exports = mongoose.model("Order", orderSchema);


