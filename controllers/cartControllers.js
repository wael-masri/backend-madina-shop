const asyncHandler = require("express-async-handler");
const ApiError = require("../middlewares/errors/apiError");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};
const calcTotalCartQuantity = (cart) => {
  let qty = 0;
  
  cart.cartItems.forEach((item) => {
    qty += item.quantity;
  });
  return qty;
};

// @desc    Add product to  cart
//  -http://localhost:5000/api/carts/
// @access  Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color, size, model,quantity } = req.body;
  const product = await Product.findById(productId);
    let dateNow = new Date(Date.now()).getTime();
    let expire = new Date(product.expire).getTime();
    if (expire > dateNow && product.priceAfterDiscount > 0) {
      product.price = product.priceAfterDiscount;
    }
  
  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });
  
  if (!cart) {
    // create cart fot logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        { product: productId, color, size, model, price: product.price,quantity },
      ],
    });
  } else {
    // product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) =>
        item.product._id.toString() === productId  &&
        item.color === color &&
        item.size === size &&
        item.model === model
      
    );

    if (productIndex > -1) {
      console.log("hello")
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += quantity;

      cart.cartItems[productIndex] = cartItem;
    } else {
      // product not exist in cart,  push product to cartItems array
      cart.cartItems.push({ product: productId, color, price: product.price,size,model,quantity });
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    numOfCartItems: calcTotalCartQuantity(cart),
    data: cart,
  });
});

// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      ApiError(`There is no cart for this user id : ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    numOfCartItems: calcTotalCartQuantity(cart),
    data: cart,
  });
});

// @desc    Remove specific cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Private/User
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  calcTotalCartPrice(cart);
  cart.save();

  res.status(200).json({
    numOfCartItems: calcTotalCartQuantity(cart),
    data: cart,
  });
});

// @desc    clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).json({
    status: "success"
  });
});

// @desc    Update specific cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(ApiError(`there is no cart for user ${req.user._id}`, 404));
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      ApiError(`there is no item for this id :${req.params.itemId}`, 404)
    );
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    numOfCartItems: calcTotalCartQuantity(cart),
    data: cart,
  });
});

// @desc    Apply coupon on logged user cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(ApiError(`Coupon is invalid or expired`, 500));
  }

  // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });

  const totalPrice = cart.totalCartPrice;

  // 3) Calculate price after priceAfterDiscount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2); // 99.23

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    numOfCartItems: calcTotalCartQuantity(cart),
    data: cart,
  });
});
