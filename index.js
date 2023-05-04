//LIBRARY IMPORT
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
//PAGES IMPORT
const mountRoutes = require("./routes");
const { webhookCheckout } = require("./controllers/orderControllers");
//MIDDLEWARES IMPORT
const ApiError = require("./middlewares/errors/apiError");
const globalError = require("./middlewares/errors/globalError");
const ErrorOutsideExpress = require("./middlewares/errors/errorOutsideExpress");
const passportSetup = require("./passport");
//DATABASE IMPORT
const dbConnection = require("./database");
const cookieSession = require("cookie-session");
const passport = require("passport");
dotenv.config({ path: "config.env" });

const app = express();
app.use(cors());
//MIDDLEWARES ROUTES
app.use(express.json());
app.use("/products",express.static(__dirname + "assets/uploads/products"));
app.use("/brands",express.static("assets/uploads/brands"));
app.use("/categories",express.static(__dirname + "assets/uploads/categories"));
app.use("/users",express.static(__dirname + "assets/uploads/users"));
//app.use(express.static(__dirname + "/assets/uploads/"));
//app.use("/", express.static(__dirname + "/assets/uploads/"));
app.options("*", cors());
//COMPRESS ALL RESPONSE
app.use(compression());

// google auth
app.use(
  cookieSession({
    name: "session",
    keys: ["cyberwolve"],
    maxAge: 24 * 60 * 60 * 100,
  })
);
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});
app.use(passport.initialize());
app.use(passport.session());
// google auth

//webhhok checkout
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);
//EXCUTE DATABASE CONNECTION
dbConnection();

mountRoutes(app);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});
// app.all("*", (req, res, next) => {
//   next(ApiError(`Can't find this router..! ${req.originalUrl}`, 400));
// });
//GLOBAL ERROR HANDLING MIDDLEWARE FOR EXPRESS
app.use(globalError);

//SERVER SIDE RUNNING
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running... PORT:${PORT}`);
});

//HANDLE REJECTION ERROR OUTSIDE EXPRESS (SUCH: MONGODB ERRORS)
ErrorOutsideExpress(server);
