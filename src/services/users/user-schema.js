import mongoose from "mongoose";
import bcrypt from "bcrypt"

const {Schema, modal} = mongoose

const UserSchema = new Schema({
    name: { type: String, required: true},
    surname: { type: String, required: true},
    email: { type: String, required: true, unique:[true, "email must be unique"] },
    avatar: { type: String, default: "https://ui-avatars.com/api/?name=John+Doe" },
    password: { type: String },
    typeOfUser :{ type: String, enum:["user", "admin", "investor"], default:"user"}
},{
    timestamps: true,
})

UserSchema.pre("save", async function(next){
    const newUser = this
    const plainPw = newUser.password
    if(newUser.isModified("password")){
        const hash = await bcrypt.hash(plainPw,11)
    }
    next()
})

UserSchema.methods.toJSON = function() {
    const userDocument = this
    const userObject = userDocument.toObject()
    delete userObject.password
    return userObject
}

UserSchema.statics.checkCredentials = async function(email, plainPW){
    const user = await this.findOne({email})
    if(user){
        const isMatch = bcrypt.compare(plainPW, user.password)
        return isMatch? user: null
         
    } else
        return null
}

export default modal("Users", UserSchema)