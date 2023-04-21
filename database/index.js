const mongoose = require("mongoose");

//CONNECT WITH MONGOOSE
const dbConnection = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.MONGO_URI)
    .then((conn) => console.log(`connected..${conn.connection.host}`));
  // BADAL L CATCH ERROR WE CREATED GLOBALERROR FOR THAT
};
module.exports = dbConnection;


