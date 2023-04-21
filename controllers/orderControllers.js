const Stripe = require("stripe");
const asyncHandler = require("express-async-handler");
const ApiError = require("../middlewares/errors/apiError");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const ApiFeatures = require("../middlewares/ApiFeatures");
const stripe = Stripe(
  "sk_test_51Mz3NOFzlUFPt6QQnxOVnZ9JrtwSGMMMjBRKyGhpslP2zXH5wEYKocHDG7A6RRONc5OzDVtbrtyGi6QdE06CQGSi00WPTeENlv"
);

/*
  @ POST
  @ http://localhost:5000/api/orders/cartId
  @ PRIVATE
*/
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + req.body.shippingPrice;
  const shippingPrice = req.body.shippingPrice;
  // 3) Create order with default paymentMethodType cash
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
    shippingPrice,
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: "success", data: order });
});

/*
   -get         http://localhost:5000/api/orders/
   -filter      http://localhost:5000/api/orders/?rating[gte]=5&name=wael
   -sort        http://localhost:5000/api/orders/?sort=-rating
   -paginate    http://localhost:5000/api/orders/?limit=5
   -search      http://localhost:5000/api/orders/?keyword=elect
   -limitfields http://localhost:5000/api/orders/?fields=name,rating
   -private
*/

exports.getOrder = asyncHandler(async (req, res, next) => {
  const documentCounts = await Order.countDocuments();
  const apiFeatures = new ApiFeatures(Order.find(), req.query)
    .paginate(documentCounts)
    .filter()
    .search()
    .limitFields()
    .sort();
  //excute
  const { mongooseQuery, paginationResult } = apiFeatures;
  const orders = await mongooseQuery;
  res
    .status(200)
    .json({ results: orders.length, paginationResult, data: orders });
});

// @desc    Get checkout session from stripe and send it as response
// @route   GET /api/v1/orders/checkout-session/cartId
// @access  Protected/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: totalOrderPrice * 100,
          product_data: {
            name: req.user.name,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://localhost:3000/`,
    cancel_url: `${req.protocol}://localhost:3000/checkout`,
    customer_email: req.user.email || "masri_1997@hotmail.com",
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});