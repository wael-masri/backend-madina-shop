const authRoutes = require("./auth");
const categoriesRoutes = require("./category");
const subCategoriesRoutes = require("./subCategory");
const brandsRoutes = require("./brand");
const usersRoutes = require("./user");
const productsRoutes = require("./product");
const couponRoutes = require("./coupon");
const reviewRoutes = require("./review");
const kanbanRoutes = require("./kanban");
const cartRoutes = require("./cart");
const orderRoutes = require("./order");
const mountRoutes = (app) => {
    app.use("/api/auth", authRoutes);
    app.use("/api/categories", categoriesRoutes);
    app.use("/api/subCategories", subCategoriesRoutes);
    app.use("/api/brands", brandsRoutes);
    app.use("/api/users", usersRoutes);
    app.use("/api/products", productsRoutes);
    app.use("/api/coupons", couponRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/kanbans", kanbanRoutes);
    app.use("/api/carts", cartRoutes);
    app.use("/api/orders", orderRoutes);
  };
  
  module.exports = mountRoutes;