const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("./models/userModel");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config({ path: "config.env" });
console.log("hellooooo");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      scope: ["profile", "email"],
      response_type: "application/json",
    },
    function (accessToken, refreshToken, profile, callback) {
		
      User.findOne({ googleId: profile.id }, async function (err, user) {
        if (user) {
          let token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: process.env.JWT_EXPIRED_TIME,
            }
          );
          const updatedUser = {
            name: profile.displayName,
            email: profile.emails[0].value,
            imageGoogle: profile.photos[0].value,
            tokenGoogle: token,
          };
          await User.findOneAndUpdate(
            { _id: user.id },
            { $set: updatedUser },
            { new: true }
          ).then((result) => {
            return callback(err, result);
          });
        } else {
          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            imageGoogle: profile.photos[0].value,
			
          });
          newUser.save().then(async (result) => {
            let obje = {};
            let token = jwt.sign(
              { userId: result._id },
              process.env.JWT_SECRET_KEY,
              {
                expiresIn: process.env.JWT_EXPIRED_TIME,
              }
            );
            obje.tokenGoogle = token;
            await User.findOneAndUpdate(
              { _id: result.id },
              { $set: obje },
              { new: true }
            ).then((result) => {
              return callback(err, result);
            });
          });
       }
     });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
