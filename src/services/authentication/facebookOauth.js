import createError from "http-errors";
import passport from "passport";
import FacebookStrategy from "passport-facebook"
import UserModel from "../users/user-schema.js"
import { authenticateUser } from "./tools.js";

const  facebookStrategy = new FacebookStrategy({
    clientID : process.env.FACEBOOK_ID,
    clientSecret : process.env.FACEBOOK_SECRET,
    callbackURL : `${process.env.API_URL}/users/facebookRedirect`
}, 
async(accessToken, refreshToken, profile, passportNext) => {
    try {
        const user = await UserModel.findOne({email: profile.emails[0].value})
        if(user){
            const token = await authenticateUser(user)
            passportNext(null, {token})
        }else {
            const newUser = new UserModel({
                name:profile.name.givenName || profile.emails[0].value.split("@")[0],
                surname : profile.name.familyName || "Not Given",
                email : profile.emails[0].value,
                googleId : profile.id,
                avatar : profile.photos[0].value
            })

            const savedUser = await newUser.save()
            const {token} = await authenticateUser(savedUser)
            passportNext(null, {token})
        }
    } catch (error) {
        console.log(error)
        throw createError(error)
    }
})

passport.serializeUser((data, passportNext) => {
    passportNext(null, data)
})

export default facebookStrategy
