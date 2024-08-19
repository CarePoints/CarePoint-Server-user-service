import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { User, UserDocument } from "../infastructure/database/model/userModel"; // Ensure the correct path to your User model

dotenv.config();

const passportConfig = () => {
  // Serialize user ID into session
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  // Deserialize user ID from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Configure Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        callbackURL: "/user-service/google/redirect",
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET as string,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile._json.email });

          if (user) {
            // User already exists, return the user
            console.log('user already exist!')
            return done(null, user);
          } else {
            // Create a new user
            const newUser = new User({
              firstname: profile._json.given_name || "",  // Ensure you handle cases where profile._json.given_name may be undefined
              lastname: profile._json.family_name || "",  // Similarly handle profile._json.family_name
              email: profile._json.email,
              isBlocked: false,
              isVerified: true, // Set according to your logic
              roles: "user",    // Default role
              profilePic: profile._json.picture || null, // Optional: Set profile picture if available
            });
            console.log('newuser',newUser)
            // Save the new user to the database
            await newUser.save();
            done(null, newUser);
          }
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
};

export default passportConfig;
