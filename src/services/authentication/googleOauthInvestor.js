import createError from "http-errors";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20"
import UserModel from "../users/user-schema.js"
import { authenticateUser } from "./tools.js";

const  googleStrategyInvestor = new GoogleStrategy({
    clientID : process.env.GOOGLE_ID,
    clientSecret : process.env.GOOGLE_SECRET,
    callbackURL : `${process.env.API_URL}/users/googleRedirectInvestor`
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
                avatar : profile.photos[0].value,
                role : "investor"

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

export default googleStrategyInvestor
