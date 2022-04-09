import createError from "http-errors";
import UserModel from "../users/user-schema.js"
import passport from "passport";
import LinkedInStrategy from "passport-linkedin"



const linkedinStrategy = new LinkedInStrategy({
    consumerKey: process.env.LINKEDIN_API_KEY,
    consumerSecret : process.env.LINKEDIN_SECRET_KEY,
    callbackURL: `${process.env.API_URL}/users/linkedinRedirect`
  },
  async(token, tokenSecret, profile, done) => {
      try {
          const user = await UserModel.findOne({email:profile.emails[0].value})
          if(user){
            const token = await authenticateUser(user)
            passportNext(null, {token})
        }else {
            const newUser = new UserModel({
                name:profile.name.firstName || profile.emails[0].value.split("@")[0],
                surname : profile.name.lastName || "Not Given",
                email : profile.emails[0].value,
                linkedinId : profile.id,
                avatar : profilePicture
            })

            const savedUser = await newUser.save()
            const {token} = await authenticateUser(savedUser)
            passportNext(null, {token})
        }
        } catch (error) {
          throw createError(error)
      }
    // User.findOrCreate({ linkedinId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
  }
);

passport.serializeUser((data, passportNext) => {
    passportNext(null, data)
})

export default linkedinStrategy