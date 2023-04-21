//LIBRARY IMPORT
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
//PAGES IMPORT
const mountRoutes = require("./routes");
const {webhookCheckout} = require("./controllers/orderControllers");
//MIDDLEWARES IMPORT
const ApiError = require("./middlewares/errors/apiError");
const globalError = require("./middlewares/errors/globalError");
const ErrorOutsideExpress = require("./middlewares/errors/errorOutsideExpress");
//DATABASE IMPORT
const dbConnection = require("./database");
console.log("hello backend");
dotenv.config({ path: "config.env" });
const app = express();

app.use(cors());
app.options("*", cors());
//COMPRESS ALL RESPONSE
app.use(compression());
console.log("MedinaShop Running...")
//webhhok checkout
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);
//EXCUTE DATABASE CONNECTION
dbConnection();

//MIDDLEWARES ROUTES
app.use(express.json());
app.use(express.static(path.join(__dirname, "assets/uploads")));
mountRoutes(app);
app.all("*", (req, res, next) => {
  next(ApiError(`Can't find this router..! ${req.originalUrl}`, 400));
});
//GLOBAL ERROR HANDLING MIDDLEWARE FOR EXPRESS
app.use(globalError);

//SERVER SIDE RUNNING
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running... PORT:${PORT}`);
});

//HANDLE REJECTION ERROR OUTSIDE EXPRESS (SUCH: MONGODB ERRORS)
ErrorOutsideExpress(server);
