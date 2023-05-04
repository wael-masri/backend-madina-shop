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
  let filter = {};
  if(req.filterObj){
   filter=req.filterObj;
  }
  const documentCounts = await Order.countDocuments();
  
  const apiFeatures = new ApiFeatures(Order.find(filter), req.query)
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
  let objectInfo = {};
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
 
  objectInfo = req.body.shippingAddress;
   objectInfo.shippingPrice = req.body.shippingPrice;
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
    success_url: "https://madina-shop-frontend.onrender.com/",
    cancel_url: "https://madina-shop-frontend.onrender.com/checkout",
    customer_email: req.user.email || "masri_1997@hotmail.com",
    client_reference_id: req.params.cartId,
    metadata: objectInfo,
  });

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const detailData = session.metadata;
  const shippingPrice = detailData.shippingPrice;
  delete detailData.shippingPrice;
  const oderPrice = session.amount_total / 100;
  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });
  
  // 3) Create order with default paymentMethodType card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress: detailData,
    shippingPrice: shippingPrice,
    totalOrderPrice: oderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
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
    await Cart.findByIdAndDelete(cartId);
  }
};
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    //  Create order
    console.log("create Orderrr....");
    createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});
exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if(req.query.refund){
    var isUpdated = (req.query.refund === 'true')
    req.filterObj = { user: req.user._id,refund: isUpdated};
  }
 
  next();
});

exports.updateOrderRefund = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  if(req.body.refund){
    order.refund = false;
  }else{
    order.refund = true;
  }
  
  order.refundAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: 'success', data: updatedOrder });
});
